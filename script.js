// =========================================================
// --- DATA LOADING ---
// =========================================================
// We start with an empty array. The data is fetched from data.json.
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
    
    // START THE APP HERE
    // We only run the logic after this line ensures data exists.
    initApp(); 
  })
  .catch(error => {
    console.error("Error loading JSON:", error);
    // Optional: Display an error message on the screen for the user
    document.body.innerHTML = "<h3 style='color:red; text-align:center; margin-top:50px;'>Error loading career data. Please check data.json.</h3>";
  });

// =========================================================
// --- MAIN APPLICATION LOGIC ---
// =========================================================

// We wrap the entire application in a function so it doesn't run prematurely.
function initApp() {

    // --- 0. INJECT CSS FOR COLLAPSING BEHAVIOR ---
    if (!document.getElementById('dynamic-collapse-style')) {
        const style = document.createElement('style');
        style.id = 'dynamic-collapse-style';
        style.innerHTML = `
            .role-card.hidden { display: none !important; }
            /* Removed transition to ensure lines draw correctly immediately */
        `;
        document.head.appendChild(style);
    }

    const container = document.getElementById('chartContainer');
    const svgLayer = document.getElementById('connections-layer');
    // Using a safe access pattern for the viewport
    const viewport = document.querySelector('.chart-viewport') || document.body; 

    const detailsPanel = {
        title: document.getElementById('detailTitle'),
        level: document.getElementById('detailLevel'),
        desc: document.getElementById('detailDesc'),
        req: document.getElementById('detailReq'),
        reqSection: document.getElementById('reqSection')
    };

    // State for drag functionality
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

            level.roles.forEach(role => {
                const card = document.createElement('div');
                card.className = 'role-card';
                card.id = `card-${role.id}`;
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

        // Initial draw (No highlight)
        setTimeout(() => drawLines(false), 100);
    }

    // 2. Draw SVG Lines
    // Added 'isHighlighted' parameter to force red lines when filtering
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

    function createPath(sourceObj, targetObj, isHighlighted) {
        const sourceEl = sourceObj.element;
        const targetEl = targetObj.element;

        // Robust coordinate calculation including scroll offsets
        const containerRect = container.getBoundingClientRect();
        const sRect = sourceEl.getBoundingClientRect();
        const tRect = targetEl.getBoundingClientRect();

        // Calculate positions relative to the container content
        const x1 = (sRect.right - containerRect.left) + container.scrollLeft;
        const y1 = (sRect.top - containerRect.top) + (sRect.height / 2) + container.scrollTop;
        
        const x2 = (tRect.left - containerRect.left) + container.scrollLeft;
        const y2 = (tRect.top - containerRect.top) + (tRect.height / 2) + container.scrollTop;

        const controlOffset = (x2 - x1) / 2;
        const pathData = `M ${x1} ${y1} C ${x1 + controlOffset} ${y1}, ${x2 - controlOffset} ${y2}, ${x2} ${y2}`;

        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", pathData);
        
        // APPLY CLASS: If we are in "Select Mode", make lines Red (highlighted). 
        // Otherwise use default.
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
        
        // Draw lines without highlight (Standard view)
        drawLines(false);
    }

    // 4. Selection Logic
    function selectRole(role) {
        // Update details...
        detailsPanel.title.textContent = role.title;
        detailsPanel.level.textContent = role.dept;
        detailsPanel.desc.textContent = role.desc;
        if(role.req) {
            detailsPanel.req.textContent = role.req;
            detailsPanel.reqSection.style.display = "block";
        } else {
            detailsPanel.reqSection.style.display = "none";
        }

        // Identify Path
        const relatedIds = new Set();
        relatedIds.add(role.id);
        
        function collectChildren(currentData) {
            if(!currentData.nextSteps) return;
            currentData.nextSteps.forEach(nextId => {
                relatedIds.add(nextId);
                const nextRoleData = findRoleData(nextId); 
                if(nextRoleData) collectChildren(nextRoleData);
            });
        }
        collectChildren(role);

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

        // FORCE REDRAW: Pass 'true' to make lines Red
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

    window.addEventListener('resize', () => drawLines(false)); // Redraw standard on resize
    renderChart();
}





