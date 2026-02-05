// =========================================================
// --- DATA LOADING ---
// =========================================================
let CAREER_DATA = []; 

// Fetch the external JSON file
fetch('data.json')
  .then(response => {
    if (!response.ok) {
        throw new Error("HTTP error " + response.status);
    }
    return response.json();
  })
  .then(data => {
    CAREER_DATA = data;
    console.log("Data loaded successfully");
    
    // START THE APP
    initApp(); 
  })
  .catch(error => {
    console.error("Error loading JSON:", error);
    document.body.innerHTML = "<h3 style='color:red; text-align:center; margin-top:50px;'>Error loading career data. Please check data.json.</h3>";
  });

// =========================================================
// --- MAIN APPLICATION LOGIC ---
// =========================================================

function initApp() {

    // --- 0. INJECT CSS (Tatil Style + Animations) ---
    if (!document.getElementById('dynamic-tatil-style')) {
        const style = document.createElement('style');
        style.id = 'dynamic-tatil-style';
        style.innerHTML = `
            :root {
                --tatil-red: #E31837; 
                --tatil-black: #000000;
                --card-border: #ccc;
            }

            .role-card.hidden { display: none !important; }
            
            /* --- CARD STYLING (MATCHING UPLOADED FILE) --- */
            .role-card {
                background: white;
                padding: 15px;
                border-radius: 4px;
                border-left: 5px solid var(--card-border);
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                cursor: pointer;
                transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease, background-color 0.3s ease;
                position: relative;
                opacity: 0; /* Start invisible for pop-in */
                animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
            }

            .role-card:hover {
                transform: translateY(-3px);
                box-shadow: 0 5px 15px rgba(0,0,0,0.15);
            }

            .role-card h3 { color: var(--tatil-black); margin-top: 0; }
            .role-card p { color: #666; }

            /* Active / Selected State */
            .role-card.active {
                border-left-color: var(--tatil-red);
                background: var(--tatil-black);
                transform: scale(1.02);
            }
            .role-card.active h3 { color: white; }
            .role-card.active p { color: #ccc; }

            /* Path Highlight State (Parents/Children) */
            .role-card.path-highlight {
                border-left-color: var(--tatil-red);
            }

            /* --- ANIMATIONS --- */
            @keyframes popIn {
                0% { opacity: 0; transform: translateY(10px) scale(0.95); }
                100% { opacity: 1; transform: translateY(0) scale(1); }
            }

            /* Line Styling */
            .connector-path {
                fill: none;
                stroke: #ccc;
                stroke-width: 2px;
                transition: stroke 0.3s ease, stroke-width 0.3s ease, opacity 0.3s ease;
            }
            .connector-path.highlighted {
                stroke: var(--tatil-red);
                stroke-width: 3px;
                filter: drop-shadow(0px 0px 2px rgba(227, 24, 55, 0.3));
            }
            .connector-path.dimmed {
                opacity: 0.1;
            }
        `;
        document.head.appendChild(style);
    }

    const container = document.getElementById('chartContainer');
    const svgLayer = document.getElementById('connections-layer');
    const viewport = document.querySelector('.chart-viewport') || document.body; 

    const detailsPanel = {
        title: document.getElementById('detailTitle'),
        level: document.getElementById('detailLevel'),
        desc: document.getElementById('detailDesc'),
        req: document.getElementById('detailReq'),
        reqSection: document.getElementById('reqSection')
    };

    const chartState = { 
        isDown: false, startX: 0, startY: 0, 
        scrollLeft: 0, scrollTop: 0, isDragging: false 
    };

    let cardElements = {}; 
    let connections = []; 

    // 1. Render the HTML Grid
    function renderChart() {
        container.innerHTML = '';
        
        CAREER_DATA.forEach((level, index) => {
            const col = document.createElement('div');
            col.className = 'level-column';
            
            const header = document.createElement('div');
            header.className = 'level-header';
            header.textContent = level.levelName;
            col.appendChild(header);

            level.roles.forEach((role, rIndex) => {
                const card = document.createElement('div');
                card.className = 'role-card';
                card.id = `card-${role.id}`;
                // Stagger animation slightly for a "waterfall" feel
                card.style.animationDelay = `${(index * 0.1) + (rIndex * 0.05)}s`;
                
                card.innerHTML = `
                    <h3>${role.title}</h3>
                    <p>${role.dept}</p>
                    ${role.nextSteps && role.nextSteps.length > 0 ? `<div class="branch-badge" title="Can branch to multiple roles">+${role.nextSteps.length}</div>` : ''}
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

        // Delay drawing lines slightly to allow card animations to settle
        setTimeout(() => drawLines(false), 300);
    }

    // 2. Draw SVG Lines
    function drawLines(isHighlighted = false) {
        svgLayer.innerHTML = ''; 
        connections = [];

        svgLayer.style.width = container.scrollWidth + 'px';
        svgLayer.style.height = container.scrollHeight + 'px';

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

    // --- UPDATED CURVE LOGIC (MATCHING UPLOADED FILE) ---
    function createPath(sourceObj, targetObj, isHighlighted) {
        const sourceEl = sourceObj.element;
        const targetEl = targetObj.element;

        const containerRect = container.getBoundingClientRect();
        const sRect = sourceEl.getBoundingClientRect();
        const tRect = targetEl.getBoundingClientRect();

        // Calculate positions including scroll offsets
        const x1 = (sRect.right - containerRect.left) + container.scrollLeft;
        const y1 = (sRect.top - containerRect.top) + (sRect.height / 2) + container.scrollTop;
        
        const x2 = (tRect.left - containerRect.left) + container.scrollLeft;
        const y2 = (tRect.top - containerRect.top) + (tRect.height / 2) + container.scrollTop;

        // NEW: Tighter curvature logic from your file (50px offset)
        // This creates a cleaner connection that exits/enters straight horizontally
        const tension = 50; 
        const pathData = `M ${x1} ${y1} C ${x1 + tension} ${y1}, ${x2 - tension} ${y2}, ${x2} ${y2}`;

        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", pathData);
        
        const classNames = isHighlighted ? "connector-path highlighted" : "connector-path";
        path.setAttribute("class", classNames);
        path.id = `path-${sourceObj.data.id}-${targetObj.data.id}`;
        
        svgLayer.appendChild(path);
        connections.push({ from: sourceObj.data.id, to: targetObj.data.id, element: path });
    }

    // 3. Reset Function
    function resetView() {
        Object.values(cardElements).forEach(obj => {
            obj.element.classList.remove('active', 'path-highlight', 'hidden');
        });

        if(detailsPanel.title) {
            detailsPanel.title.textContent = "Select a Role";
            detailsPanel.level.textContent = "Career Path Explorer";
            detailsPanel.desc.textContent = "Click on a role card to view requirements and future career opportunities.";
            detailsPanel.reqSection.style.display = "none";
        }
        
        // Wait for CSS transitions (hidden -> block) before redrawing lines
        setTimeout(() => drawLines(false), 50);
    }

    // 4. Selection Logic
    function selectRole(role) {
        detailsPanel.title.textContent = role.title;
        detailsPanel.level.textContent = role.dept;
        detailsPanel.desc.textContent = role.desc;
        if(role.req) {
            detailsPanel.req.textContent = role.req;
            detailsPanel.reqSection.style.display = "block";
        } else {
            detailsPanel.reqSection.style.display = "none";
        }

        const relatedIds = new Set();
        relatedIds.add(role.id);
        
        // A. Look Forwards
        function collectChildren(currentData) {
            if(!currentData.nextSteps) return;
            currentData.nextSteps.forEach(nextId => {
                relatedIds.add(nextId);
                const nextRoleData = findRoleData(nextId); 
                if(nextRoleData) collectChildren(nextRoleData);
            });
        }
        collectChildren(role);

        // B. Look Backwards
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

        // Apply Classes
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

        // Redraw lines after layout shift
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

    // =========================================================
    // --- DRAG & BACKGROUND CLICK LOGIC ---
    // =========================================================

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
