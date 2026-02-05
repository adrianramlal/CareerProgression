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
    // This ensures that hidden roles take up zero space, causing others to stack up.
    if (!document.getElementById('dynamic-collapse-style')) {
        const style = document.createElement('style');
        style.id = 'dynamic-collapse-style';
        style.innerHTML = `
            .role-card.hidden { display: none !important; }
            .role-card { transition: all 0.3s ease; } /* Smooth movement */
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
        isDown: false, 
        startX: 0, 
        startY: 0, 
        scrollLeft: 0, 
        scrollTop: 0, 
        isDragging: false 
    };

    let cardElements = {}; // Map ID -> DOM Element
    let connections = []; // Store line coordinates

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
                
                // CLICK EVENT FOR ROLE
                card.addEventListener('click', (e) => {
                    e.stopPropagation(); // Stop the click from hitting the background
                    if (chartState.isDragging) return; 
                    selectRole(role);
                });
                
                col.appendChild(card);
                
                cardElements[role.id] = {
                    element: card,
                    data: role
                };
            });

            container.appendChild(col);
        });

        setTimeout(drawLines, 100);
    }

    // 2. Draw SVG Lines
    function drawLines() {
        svgLayer.innerHTML = ''; 
        connections = [];

        // Update SVG size to match the current container (which might have shrunk)
        svgLayer.style.width = container.scrollWidth + 'px';
        svgLayer.style.height = container.scrollHeight + 'px';

        Object.values(cardElements).forEach(source => {
            // CRITICAL CHANGE: Do not draw lines from hidden cards
            if(source.element.classList.contains('hidden')) return;
            if(!source.data.nextSteps) return;

            source.data.nextSteps.forEach(targetId => {
                const target = cardElements[targetId];
                // Check if target exists AND is visible
                if(target && !target.element.classList.contains('hidden')) {
                    createPath(source, target);
                }
            });
        });
    }

    function createPath(sourceObj, targetObj) {
        const sourceEl = sourceObj.element;
        const targetEl = targetObj.element;

        const containerRect = container.getBoundingClientRect();
        const sRect = sourceEl.getBoundingClientRect();
        const tRect = targetEl.getBoundingClientRect();

        const x1 = (sRect.right - containerRect.left);
        const y1 = (sRect.top - containerRect.top) + (sRect.height / 2);
        
        const x2 = (tRect.left - containerRect.left);
        const y2 = (tRect.top - containerRect.top) + (tRect.height / 2);

        const controlOffset = (x2 - x1) / 2;
        const pathData = `M ${x1} ${y1} C ${x1 + controlOffset} ${y1}, ${x2 - controlOffset} ${y2}, ${x2} ${y2}`;

        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", pathData);
        path.setAttribute("class", "connector-path");
        path.id = `path-${sourceObj.data.id}-${targetObj.data.id}`;
        
        svgLayer.appendChild(path);

        connections.push({
            from: sourceObj.data.id,
            to: targetObj.data.id,
            element: path
        });
    }

    // 3. Reset Function (Restores Full View)
    function resetView() {
        // Show all cards
        Object.values(cardElements).forEach(obj => {
            obj.element.classList.remove('active', 'path-highlight', 'hidden');
        });

        // Clear details
        if(detailsPanel.title) {
            detailsPanel.title.textContent = "Select a Role";
            detailsPanel.level.textContent = "Career Path Explorer";
            detailsPanel.desc.textContent = "Click on a role card to view requirements and future career opportunities.";
            detailsPanel.reqSection.style.display = "none";
        }
        
        // Redraw lines to match the restored grid positions
        drawLines();
    }

    // 4. Selection Logic (Collapses View)
    function selectRole(role) {
        // A. Update Detail Panel
        detailsPanel.title.textContent = role.title;
        detailsPanel.level.textContent = role.dept;
        detailsPanel.desc.textContent = role.desc;
        
        if(role.req) {
            detailsPanel.req.textContent = role.req;
            detailsPanel.reqSection.style.display = "block";
        } else {
            detailsPanel.reqSection.style.display = "none";
        }

        // B. Identify "Related" Roles (The path)
        const relatedIds = new Set();
        relatedIds.add(role.id);
        
        // Find all children (recursive)
        // Note: We need to look at the raw DATA to find connections, 
        // because the 'connections' array might be empty if we are redrawing.
        function collectChildren(currentData) {
            if(!currentData.nextSteps) return;
            currentData.nextSteps.forEach(nextId => {
                relatedIds.add(nextId);
                // Find the data object for this ID to recurse
                const nextRoleData = findRoleData(nextId); 
                if(nextRoleData) collectChildren(nextRoleData);
            });
        }
        collectChildren(role);

        // C. Collapse Layout
        // Loop through ALL cards
        Object.values(cardElements).forEach(obj => {
            if (relatedIds.has(obj.data.id)) {
                // Keep visible
                obj.element.classList.remove('hidden');
                
                if (obj.data.id === role.id) {
                    obj.element.classList.add('active');
                    obj.element.classList.remove('path-highlight');
                } else {
                    obj.element.classList.add('path-highlight');
                    obj.element.classList.remove('active');
                }
            } else {
                // Hide completely (this triggers the "One Line" effect)
                obj.element.classList.add('hidden');
                obj.element.classList.remove('active', 'path-highlight');
            }
        });

        // D. Redraw lines and Recenter
        // We must wait a tiny moment for the browser to "collapse" the divs 
        // before we draw the lines to the new positions.
        setTimeout(() => {
            drawLines();
            
            // Optional: Scroll to top-left so user sees the start of the path
            if(viewport.scrollTo) {
                viewport.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
            }
        }, 50);
    }
    
    // Helper to find data by ID from the global array
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
            
            // CHECK: If it wasn't a drag, it was a click on the blank area
            if (!chartState.isDragging) {
                // Check if the click target is NOT a card
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

    // Window resize handling to redraw lines
    window.addEventListener('resize', drawLines);
    
    // Initial Run
    renderChart();
}


