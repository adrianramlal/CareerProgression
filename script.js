// =========================================================
// --- DATA LOADING ---
// =========================================================
let CAREER_DATA = []; 

fetch('data.json')
  .then(response => {
    if (!response.ok) throw new Error("HTTP error " + response.status);
    return response.json();
  })
  .then(data => {
    CAREER_DATA = data;
    initApp(); 
  })
  .catch(error => {
    console.error("Error loading JSON:", error);
  });

// =========================================================
// --- MAIN APPLICATION LOGIC ---
// =========================================================

function initApp() {

    // --- 1. INJECT CSS (VISUALS FROM UPLOADED FILE) ---
    if (!document.getElementById('dynamic-styles')) {
        const style = document.createElement('style');
        style.id = 'dynamic-styles';
        style.innerHTML = `
            :root {
                --tatil-red: #E31837; 
                --tatil-black: #000000;
                --gray-light: #f8f9fa;
            }

            /* The Grid Background */
            .chart-viewport {
                background-color: var(--gray-light);
                background-image: radial-gradient(#ddd 1px, transparent 1px);
                background-size: 20px 20px;
            }

            /* Card Styling */
            .role-card {
                background: white;
                padding: 15px;
                border-radius: 4px;
                border-left: 5px solid #ccc; /* Default Border */
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
                position: relative;
            }

            .role-card:hover {
                transform: translateY(-3px);
                box-shadow: 0 5px 15px rgba(0,0,0,0.15);
            }

            .role-card.active {
                border-left-color: var(--tatil-red);
                background: var(--tatil-black);
            }
            .role-card.active h3 { color: white; }
            .role-card.active p { color: #ccc; }
            
            .role-card.path-highlight {
                border-left-color: var(--tatil-red);
                box-shadow: 0 0 10px rgba(227, 24, 55, 0.2);
            }

            .role-card.hidden {
                display: none !important;
            }

            /* Badge */
            .branch-badge {
                position: absolute; right: 10px; top: 10px;
                background: #eee; color: #666; font-size: 10px;
                width: 20px; height: 20px; border-radius: 50%;
                display: flex; align-items: center; justify-content: center;
            }

            /* Smooth Reveal Animation */
            @keyframes popIn {
                0% { opacity: 0; transform: translateY(10px); }
                100% { opacity: 1; transform: translateY(0); }
            }
            .role-card:not(.hidden) {
                animation: popIn 0.4s ease-out forwards;
            }

            /* Line Styling */
            .connector-path {
                fill: none;
                stroke: #ccc;
                stroke-width: 2px;
                transition: d 0.5s ease, stroke 0.3s ease, stroke-width 0.3s ease;
            }
            .connector-path.highlighted {
                stroke: var(--tatil-red);
                stroke-width: 3px;
            }
        `;
        document.head.appendChild(style);
    }

    const container = document.getElementById('chartContainer');
    const svgLayer = document.getElementById('connections-layer');
    const viewport = document.querySelector('.chart-viewport') || document.body; 

    // UI Elements
    const detailsPanel = {
        title: document.getElementById('detailTitle'),
        level: document.getElementById('detailLevel'),
        desc: document.getElementById('detailDesc'),
        req: document.getElementById('detailReq'),
        reqSection: document.getElementById('reqSection')
    };

    // Drag State
    const chartState = { 
        isDown: false, startX: 0, startY: 0, 
        scrollLeft: 0, scrollTop: 0, isDragging: false 
    };

    let cardElements = {}; 
    let connections = []; 

    // --- RENDER GRID ---
    function renderChart() {
        container.innerHTML = '';
        
        CAREER_DATA.forEach((level) => {
            const col = document.createElement('div');
            col.className = 'level-column';
            
            const header = document.createElement('div');
            header.className = 'level-header';
            header.textContent = level.levelName;
            col.appendChild(header);

            level.roles.forEach(role => {
                const card = document.createElement('div');
                card.className = 'role-card';
                card.id = `card-${role.id}`;
                card.innerHTML = `
                    <h3>${role.title}</h3>
                    <p>${role.dept}</p>
                    ${role.nextSteps && role.nextSteps.length > 0 ? `<div class="branch-badge" title="Connections">+${role.nextSteps.length}</div>` : ''}
                `;
                
                card.addEventListener('click', (e) => {
                    e.stopPropagation(); 
                    if (chartState.isDragging) return; 
                    selectRole(role);
                });
                
                col.appendChild(card);
                cardElements[role.id] = { element: card, data: role };
            });

            container.appendChild(col);
        });

        setTimeout(() => drawLines(false), 100);
    }

    // --- DRAW LINES (UPDATED LOGIC) ---
    function drawLines(isHighlighted = false) {
        svgLayer.innerHTML = ''; 
        connections = [];

        // Match container size exactly
        svgLayer.setAttribute('width', container.scrollWidth);
        svgLayer.setAttribute('height', container.scrollHeight);

        Object.values(cardElements).forEach(source => {
            if(source.element.classList.contains('hidden')) return;
            if(!source.data.nextSteps) return;

            source.data.nextSteps.forEach(targetId => {
                const target = cardElements[targetId];
                if(target && !target.element.classList.contains('hidden')) {
                    createPath(source, target, isHighlighted);
                }
            });
        });
    }

    function createPath(sourceObj, targetObj, isHighlighted) {
        const sRect = sourceObj.element.getBoundingClientRect(); 
        const tRect = targetObj.element.getBoundingClientRect();
        const cRect = container.getBoundingClientRect();

        // 1. Calculate precise coordinates relative to the container
        // Note: We use cRect (container rect) to ensure lines move WITH the scrolling content
        const x1 = sRect.right - cRect.left; 
        const y1 = (sRect.top - cRect.top) + sRect.height/2;
        
        const x2 = tRect.left - cRect.left; 
        const y2 = (tRect.top - cRect.top) + tRect.height/2;

        // 2. The "Tight Curve" Logic from your file (x + 50)
        // This creates a cleaner "network" look than standard Bezier midpoints
        const pathData = `M ${x1} ${y1} C ${x1 + 50} ${y1}, ${x2 - 50} ${y2}, ${x2} ${y2}`;

        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", pathData);
        
        const classNames = isHighlighted ? "connector-path highlighted" : "connector-path";
        path.setAttribute("class", classNames);
        path.id = `path-${sourceObj.data.id}-${targetObj.data.id}`;
        
        svgLayer.appendChild(path);
        connections.push({ from: sourceObj.data.id, to: targetObj.data.id, element: path });
    }

    // --- RESET VIEW ---
    function resetView() {
        Object.values(cardElements).forEach(obj => {
            obj.element.classList.remove('active', 'path-highlight', 'hidden');
        });

        if(detailsPanel.title) {
            detailsPanel.title.textContent = "Select a Role";
            detailsPanel.level.textContent = "Career Path Explorer";
            detailsPanel.desc.textContent = "Click a card to view details.";
            detailsPanel.reqSection.style.display = "none";
        }
        
        drawLines(false);
    }

    // --- SELECTION LOGIC ---
    function selectRole(role) {
        // Details
        detailsPanel.title.textContent = role.title;
        detailsPanel.level.textContent = role.dept;
        detailsPanel.desc.textContent = role.desc;
        if(role.req) {
            detailsPanel.req.textContent = role.req;
            detailsPanel.reqSection.style.display = "block";
        } else {
            detailsPanel.reqSection.style.display = "none";
        }

        // Pathfinding (Parents & Children)
        const relatedIds = new Set();
        relatedIds.add(role.id);
        
        // Forward (Future)
        function collectChildren(currentData) {
            if(!currentData.nextSteps) return;
            currentData.nextSteps.forEach(nextId => {
                relatedIds.add(nextId);
                const nextRoleData = findRoleData(nextId); 
                if(nextRoleData) collectChildren(nextRoleData);
            });
        }
        collectChildren(role);

        // Backward (History)
        function collectParents(targetId) {
            CAREER_DATA.forEach(level => {
                level.roles.forEach(potentialParent => {
                    if (potentialParent.nextSteps && potentialParent.nextSteps.includes(targetId)) {
                        if (!relatedIds.has(potentialParent.id)) {
                            relatedIds.add(potentialParent.id);
                            collectParents(potentialParent.id); 
                        }
                    }
                });
            });
        }
        collectParents(role.id);

        // Collapse Layout
        Object.values(cardElements).forEach(obj => {
            if (relatedIds.has(obj.data.id)) {
                obj.element.classList.remove('hidden');
                
                if (obj.data.id === role.id) {
                    obj.element.classList.add('active');
                    obj.element.classList.remove('path-highlight');
                } else {
                    obj.element.classList.add('path-highlight');
                    obj.element.classList.remove('active');
                }
            } else {
                obj.element.classList.add('hidden');
                obj.element.classList.remove('active', 'path-highlight');
            }
        });

        // Redraw with delay for smooth animation
        setTimeout(() => {
            drawLines(true);
            if(viewport.scrollTo) {
                viewport.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
            }
        }, 50);
    }
    
    function findRoleData(id) {
        for (let level of CAREER_DATA) {
            const found = level.roles.find(r => r.id === id);
            if (found) return found;
        }
        return null;
    }

    // --- INTERACTION ---
    if(viewport) {
        viewport.addEventListener('mousedown', (e) => {
            chartState.isDown = true;
            chartState.isDragging = false; 
            viewport.classList.add('active');
            chartState.startX = e.pageX - viewport.offsetLeft;
            chartState.startY = e.pageY - viewport.offsetTop;
            chartState.scrollLeft = viewport.scrollLeft;
            chartState.scrollTop = viewport.scrollTop;
        });

        viewport.addEventListener('mouseleave', () => {
            chartState.isDown = false;
            viewport.classList.remove('active');
        });

        viewport.addEventListener('mouseup', (e) => {
            chartState.isDown = false;
            viewport.classList.remove('active');
            if (!chartState.isDragging) {
                if (!e.target.closest('.role-card')) {
                    resetView();
                }
            }
            setTimeout(() => { chartState.isDragging = false; }, 50);
        });

        viewport.addEventListener('mousemove', (e) => {
            if (!chartState.isDown) return;
            e.preventDefault(); 
            const x = e.pageX - viewport.offsetLeft;
            const y = e.pageY - viewport.offsetTop;
            const walkX = (x - chartState.startX); 
            const walkY = (y - chartState.startY);
            if (Math.abs(walkX) > 5 || Math.abs(walkY) > 5) {
                chartState.isDragging = true;
            }
            viewport.scrollLeft = chartState.scrollLeft - walkX;
            viewport.scrollTop = chartState.scrollTop - walkY;
        });
    }

    window.addEventListener('resize', () => drawLines(false)); 
    renderChart();
}
