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
            // Create Column
            const col = document.createElement('div');
            col.className = 'level-column';
            
            // Header
            const header = document.createElement('div');
            header.className = 'level-header';
            header.textContent = level.levelName;
            col.appendChild(header);

            // Roles
            level.roles.forEach(role => {
                const card = document.createElement('div');
                card.className = 'role-card';
                card.id = `card-${role.id}`;
                card.innerHTML = `
                    <h3>${role.title}</h3>
                    <p>${role.dept}</p>
                    ${role.nextSteps && role.nextSteps.length > 0 ? `<div class="branch-badge" title="Can branch to multiple roles">+${role.nextSteps.length}</div>` : ''}
                `;
                
                // Interaction: Check if we were dragging before selecting
                card.addEventListener('click', (e) => {
                    if (chartState.isDragging) return; // Prevent click if this was a drag action
                    selectRole(role);
                });
                
                col.appendChild(card);
                
                // Store reference
                cardElements[role.id] = {
                    element: card,
                    data: role
                };
            });

            container.appendChild(col);
        });

        // Wait for DOM layout then draw lines
        setTimeout(drawLines, 100);
    }

    // 2. Draw SVG Lines
    function drawLines() {
        svgLayer.innerHTML = ''; // Clear existing
        connections = [];

        // Set SVG size to match scrollable container width
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

        // Get coordinates relative to the chart container
        const containerRect = container.getBoundingClientRect();
        const sRect = sourceEl.getBoundingClientRect();
        const tRect = targetEl.getBoundingClientRect();

        // Calculate start (Right side of source) and end (Left side of target)
        // Adjust for scrolling
        const scrollLeft = container.parentNode.scrollLeft;

        const x1 = (sRect.right - containerRect.left);
        const y1 = (sRect.top - containerRect.top) + (sRect.height / 2);
        
        const x2 = (tRect.left - containerRect.left);
        const y2 = (tRect.top - containerRect.top) + (tRect.height / 2);

        // Bezier Curve Logic for smooth "S" shape
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

    // 3. Handle Interaction
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

        // B. Visual Reset
        document.querySelectorAll('.role-card').forEach(el => el.classList.remove('active', 'path-highlight'));
        document.querySelectorAll('.connector-path').forEach(el => {
            el.classList.remove('highlighted');
            el.classList.add('dimmed');
        });

        // C. Highlight Selected
        const selectedEl = cardElements[role.id].element;
        selectedEl.classList.add('active');

        // D. Highlight Forward Paths (Recursively)
        highlightForward(role.id);
    }

    function highlightForward(currentId) {
        // Find paths starting from this ID
        const forwardConnections = connections.filter(c => c.from === currentId);
        
        forwardConnections.forEach(conn => {
            // Highlight Line
            conn.element.classList.remove('dimmed');
            conn.element.classList.add('highlighted');

            // Highlight Target Card
            const targetCard = cardElements[conn.to].element;
            targetCard.classList.add('path-highlight');

            // Recurse
            highlightForward(conn.to);
        });
    }

    // =========================================================
    // --- DRAG TO SCROLL FUNCTIONALITY ---
    // =========================================================
    const viewport = document.querySelector('.chart-viewport');

    if(viewport) { // Safety check in case class name changed
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

        viewport.addEventListener('mouseup', () => {
            chartState.isDown = false;
            viewport.classList.remove('active');
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
