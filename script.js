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

        svgLayer.style.width = container.scrollWidth + 'px';
        svgLayer.style.height = container.scrollHeight + 'px';

        Object.values(cardElements).forEach(source => {
            if(!source.data.nextSteps) return;

            source.data.nextSteps.forEach(targetId => {
                const target = cardElements[targetId];
                if(target) {
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

    // 3. NEW: Reset Function (Cleans up the view)
    function resetView() {
        // Make all cards visible again
        Object.values(cardElements).forEach(obj => {
            obj.element.classList.remove('active', 'path-highlight');
            obj.element.style.opacity = '1';
            obj.element.style.pointerEvents = 'auto'; // Re-enable clicking
        });

        // Make all lines visible again
        connections.forEach(conn => {
            conn.element.classList.remove('highlighted', 'dimmed');
            conn.element.style.opacity = '1';
        });

        // Reset details panel text
        if(detailsPanel.title) {
            detailsPanel.title.textContent = "Select a Role";
            detailsPanel.level.textContent = "Career Path Explorer";
            detailsPanel.desc.textContent = "Click on a role card to view requirements and future career opportunities.";
            detailsPanel.reqSection.style.display = "none";
        }
    }

    // 4. UPDATED: Selection Logic
    function selectRole(role) {
        // First, reset everything locally to ensure clean state calculation
        Object.values(cardElements).forEach(obj => {
            obj.element.classList.remove('active', 'path-highlight');
        });

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
        // We use a Set to store the IDs of the role and its children
        const relatedIds = new Set();
        relatedIds.add(role.id);
        
        // Recursive function to find all downstream children
        function collectChildren(currentId) {
            const children = connections.filter(c => c.from === currentId);
            children.forEach(c => {
                relatedIds.add(c.to);
                collectChildren(c.to); // Recurse
            });
        }
        collectChildren(role.id);

        // C. Apply Visibility Logic
        // Loop through ALL cards
        Object.values(cardElements).forEach(obj => {
            if (relatedIds.has(obj.data.id)) {
                // If related: Keep visible
                obj.element.style.opacity = '1';
                obj.element.style.pointerEvents = 'auto';
                
                if (obj.data.id === role.id) {
                    obj.element.classList.add('active');
                } else {
                    obj.element.classList.add('path-highlight');
                }
            } else {
                // If NOT related: "Disappear"
                obj.element.style.opacity = '0.05'; // Faint ghost (so layout stays) or 0 for invisible
                obj.element.style.pointerEvents = 'none'; // Prevent clicking hidden items
            }
        });

        // D. Apply Line Visibility
        connections.forEach(conn => {
            // Only show lines that connect two "related" nodes
            if (relatedIds.has(conn.from) && relatedIds.has(conn.to)) {
                conn.element.style.opacity = '1';
                conn.element.classList.add('highlighted');
                conn.element.classList.remove('dimmed');
            } else {
                conn.element.style.opacity = '0.05'; // Hide unconnected lines
                conn.element.classList.add('dimmed');
            }
        });
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

