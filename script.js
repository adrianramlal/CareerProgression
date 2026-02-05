        // =========================================================
        // --- ADMINISTRATOR CONFIGURATION: EDIT DATA HERE ---
        // =========================================================
        // Edit this JSON object to add/remove roles or change connections.
        // "nextSteps": Array of IDs that this role leads TO.
        
        const CAREER_DATA = [
            {
                levelName: "Entry Level (Band A)",
                roles: [
                    { id: "office_asst", title: "Office Assistant", dept: "Operations", desc: "General office support duties including filing and mail distribution.", req: "3-5 O'Levels.", nextSteps: ["admin_asst_i"] },
                    { id: "courier", title: "Courier", dept: "Operations", desc: "Responsible for the safe and timely delivery of documents and packages.", req: "Valid Driver's Permit, O'Levels.", nextSteps: ["office_asst"] },
                    { id: "telephone_op", title: "Telephone Operator", dept: "Admin", desc: "Manages incoming calls and directs them to appropriate personnel.", req: "3-5 O'Levels, clear speech.", nextSteps: ["csr_i"] }
                ]
            },
            {
                levelName: "Level 1 (Band B)",
                roles: [
                    { id: "accounting_asst_i", title: "Accounting Assistant I", dept: "Finance", desc: "Performs routine clerical accounting duties, reconciliations, and cheque preparation.", req: "5 O'Levels, 3 A'Levels or CAT/ACCA L1. 1 Yr Exp.", nextSteps: ["accounting_asst_ii"] },
                    { id: "admin_asst_i", title: "Administrative Assistant I", dept: "Admin", desc: "Provides administrative support, telephone coverage, and mail handling.", req: "5 O'Levels, 2 CAPE. 1 Yr Exp.", nextSteps: ["admin_asst_ii"] },
                    { id: "csr_i", title: "Customer Service Rep I", dept: "Client Services", desc: "Provides admin support and level 1 customer service. Processes routine non-financial changes.", req: "5 O'Levels, 2 A'Levels. 0-1 Yr Exp.", nextSteps: ["csr_ii"] },
                    { id: "prem_proc_clerk_i", title: "Premium Processing Clerk I", dept: "Finance", desc: "Performs clerical accounting tasks, salary deduction deposits, and posting entries.", req: "5 O'Levels, 3 A'Levels, Diploma. 1 Yr Exp.", nextSteps: ["prem_proc_clerk_ii"] },
                    { id: "reinsurance_admin_i", title: "Reinsurance Administrator I", dept: "Underwriting", desc: "Maintains records, compiles policy listings, and supports the Reinsurance team.", req: "Bachelor's Degree or LOMA. 0-1 Yr Exp.", nextSteps: ["reinsurance_admin_ii"] },
                    { id: "policy_issue_clerk", title: "Policy Issue Clerk", dept: "Operations", desc: "Prepares and assembles policy documents for delivery.", req: "5 O'Levels. Attention to detail.", nextSteps: ["policy_registrar_i"] },
                    { id: "cust_relations_officer_i", title: "Customer Relations Officer I", dept: "Sales Admin", desc: "Builds relationships with clients/agents. Supports growth of the portfolio.", req: "5 O'Levels, Diploma. 0-1 Yr Exp.", nextSteps: ["cust_relations_officer_ii"] }
                ]
            },
            {
                levelName: "Level 2 (Band C)",
                roles: [
                    { id: "accounting_asst_ii", title: "Accounting Assistant II", dept: "Finance", desc: "Performs clerical accounting, reconciles named accounts, and assists with payroll.", req: "BSc Accounting or ACCA L2. 3 Yrs Exp.", nextSteps: ["accounting_asst_iii"] },
                    { id: "admin_asst_ii", title: "Administrative Assistant II", dept: "Admin", desc: "Supports managers/underwriters, prepares reports, manages schedules.", req: "2 CAPE, Diploma. 2 Yrs Exp.", nextSteps: ["admin_asst_iii"] },
                    { id: "csr_ii", title: "Customer Service Rep II", dept: "Client Services", desc: "Resolves wide variety of issues. Processes surrenders, maturities, and claims.", req: "5 O'Levels, 2 A'Levels, LOMA 1&2. Knowledge of products.", nextSteps: ["csr_iii"] },
                    { id: "prem_proc_clerk_ii", title: "Premium Processing Clerk II", dept: "Finance", desc: "Reconciles input to financial systems, processes payments, investigates queries.", req: "5 O'Levels, 3 A'Levels, Diploma. 3 Yrs Exp.", nextSteps: ["prem_proc_clerk_iii"] },
                    { id: "reinsurance_admin_ii", title: "Reinsurance Administrator II", dept: "Underwriting", desc: "Administers treaties, cedes risk, validates billings, and analyzes claims.", req: "Bachelor's Degree, LOMA. 2 Yrs Exp.", nextSteps: ["reinsurance_admin_iii"] },
                    { id: "underwriter_i", title: "Underwriter I", dept: "Underwriting", desc: "Examines applicant health status and underwrites ordinary life/group excess.", req: "5 O'Levels, 2 A'Levels, LOMA 280/290. 1-2 Yrs Exp.", nextSteps: ["underwriter_ii"] },
                    { id: "cust_retention_rep_i", title: "Customer Retention Rep I", dept: "Operations", desc: "(Conservation Officer I) Contacts customers to prevent termination and manage orphan portfolio.", req: "5 O'Levels, Sales cert. 2-3 Yrs Exp.", nextSteps: ["cust_retention_rep_ii"] },
                    { id: "pension_admin_i", title: "Pension Administrator I", dept: "Pensions", desc: "Maintains databases, prepares benefit calcs, ensures regulatory compliance.", req: "Assoc Degree (Actuarial/Business). 1 Yr Exp.", nextSteps: ["pension_admin_ii"] },
                    { id: "group_life_admin_i", title: "Group Life Administrator I", dept: "Group Business", desc: "Updates Group Life plans, files, and client information. Prepares proposals.", req: "5 CXC, Diploma, LOMA. 1-2 Yrs Exp.", nextSteps: ["group_life_admin_ii"] }
                ]
            },
            {
                levelName: "Level 3 (Band D)",
                roles: [
                    { id: "accounting_asst_iii", title: "Accounting Assistant III", dept: "Finance", desc: "Prepares Agents payroll, statutory deductions, and financial statements.", req: "BSc Accounting, ACCA L3. 5 Yrs Exp.", nextSteps: [] },
                    { id: "admin_asst_iii", title: "Administrative Assistant III", dept: "Admin", desc: "High-level support to Manager. Board reports. Complex administration.", req: "2 CAPE, Diploma, LOMA. 3 Yrs Exp.", nextSteps: [] },
                    { id: "csr_iii", title: "Customer Service Rep III", dept: "Client Services", desc: "Leads team, executes technical processes, subject matter expert in test environment.", req: "Degree, ACS/LOMA. Lead team experience.", nextSteps: ["cust_relations_officer_ii"] },
                    { id: "prem_proc_clerk_iii", title: "Premium Processing Clerk III", dept: "Finance", desc: "Resolves complex queries, reconciles suspense accounts, logs bankers orders.", req: "BSc or 5 Yrs Exp.", nextSteps: ["accounting_asst_iii"] },
                    { id: "reinsurance_admin_iii", title: "Reinsurance Administrator III", dept: "Underwriting", desc: "Treaty administration, reconciliations, regulatory compliance, and reporting.", req: "Bachelor's Degree, Expert Treaty knowledge. 5 Yrs Exp.", nextSteps: [] },
                    { id: "underwriter_ii", title: "Underwriter II", dept: "Underwriting", desc: "Assesses risk, trains trainees, makes counter offers.", req: "Assoc Degree, LOMA 281/291. 2-3 Yrs Exp.", nextSteps: ["underwriter_iii"] },
                    { id: "cust_retention_rep_ii", title: "Customer Retention Rep II", dept: "Operations", desc: "(Conservation Officer II) Advises clients on solutions, acquires new business.", req: "Bachelor's Degree, 5 O'Levels. 4-5 Yrs Exp.", nextSteps: ["cust_retention_rep_iii"] },
                    { id: "pension_admin_ii", title: "Pension Administrator II", dept: "Pensions", desc: "Databases, tax computations, valuation reporting, trustee meeting coordination.", req: "BS/BA Degree, LOMA ASRI. 4 Yrs Exp.", nextSteps: ["pension_admin_iii"] },
                    { id: "group_life_admin_ii", title: "Group Life Administrator II", dept: "Group Business", desc: "Prepares contracts, endorsements, premium billings and reinsurance reports.", req: "Assoc Degree, LOMA. 2-3 Yrs Exp.", nextSteps: ["group_life_admin_iii"] },
                    { id: "systems_admin_i", title: "Systems Administrator I", dept: "IT", desc: "Maintains IT infrastructure and supports users.", req: "Degree in CS/IT. 2 Yrs Exp.", nextSteps: ["systems_admin_ii"] },
                    { id: "cust_relations_officer_ii", title: "Customer Relations Officer II", dept: "Sales Admin", desc: "Builds relationships, supervises branch staff, resolves disputes.", req: "Associate Degree, LOMA. 2-4 Yrs Exp.", nextSteps: ["cust_relations_officer_iii"] }
                ]
            },
            {
                levelName: "Level 4 (Band E)",
                roles: [
                    { id: "underwriter_iii", title: "Underwriter III", dept: "Underwriting", desc: "Assesses complex risk, approves junior decisions, trains agents.", req: "Bachelor's Degree, FALU asset. 4-5 Yrs Exp.", nextSteps: [] },
                    { id: "systems_admin_ii", title: "Systems Administrator II", dept: "IT", desc: "Senior infrastructure support and system maintenance.", req: "Degree in CS/IT. 4 Yrs Exp.", nextSteps: ["systems_admin_iii"] },
                    { id: "cust_relations_officer_iii", title: "Customer Relations Officer III", dept: "Sales Admin", desc: "Supervises customer service staff, strategic support for portfolio growth.", req: "Degree, LOMA. 5 Yrs Exp.", nextSteps: [] },
                    { id: "marketing_officer", title: "Marketing Officer", dept: "Marketing", desc: "Executes marketing strategies and campaigns.", req: "Degree in Marketing. 3-4 Yrs Exp.", nextSteps: [] },
                    { id: "mortgage_officer", title: "Mortgage Officer", dept: "Finance", desc: "Manages mortgage portfolio and client relations.", req: "Degree in Finance/Business. 3-5 Yrs Exp.", nextSteps: [] }
                ]
            },
            {
                levelName: "Specialist (Band F)",
                roles: [
                    { id: "actuarial_asst", title: "Actuarial Assistant", dept: "Actuarial", desc: "Supports actuarial valuations and reporting.", req: "Degree in Actuarial/Math. 1 Yr Exp.", nextSteps: [] },
                    { id: "systems_admin_iii", title: "Systems Administrator III", dept: "IT", desc: "Lead IT Administrator for infrastructure.", req: "Master's/Degree. Senior exp.", nextSteps: [] },
                    { id: "cust_retention_rep_iii", title: "Customer Retention Rep III", dept: "Operations", desc: "(Conservation Officer III) Strategic conservation, complex analysis, reporting.", req: "Degree, LOMA FLMI. 6 Yrs Exp.", nextSteps: [] },
                    { id: "group_life_admin_iii", title: "Group Life Administrator III", dept: "Group Business", desc: "Updates plans, assists in strategic planning and procedure formulation.", req: "Bachelor's Degree, LOMA/FLMI. 4-5 Yrs Exp.", nextSteps: [] },
                    { id: "pension_admin_iii", title: "Pension Administrator III", dept: "Pensions", desc: "Benefit models, quotation packages, client presentations.", req: "BS/BA Degree, LOMA FSRI. 8 Yrs Exp.", nextSteps: [] }
                ]
            }
        ];

        // =========================================================
        // --- LOGIC: DO NOT EDIT BELOW UNLESS YOU KNOW JS ---
        // =========================================================

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

        viewport.addEventListener('mousedown', (e) => {
            chartState.isDown = true;
            chartState.isDragging = false; // Reset drag status
            viewport.classList.add('active');
            
            // Record start positions
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
            
            // Slight delay before resetting dragging flag to allow click handlers to check it
            setTimeout(() => { chartState.isDragging = false; }, 50);
        });

        viewport.addEventListener('mousemove', (e) => {
            if (!chartState.isDown) return;
            e.preventDefault(); // Prevent text selection
            
            const x = e.pageX - viewport.offsetLeft;
            const y = e.pageY - viewport.offsetTop;
            const walkX = (x - chartState.startX); 
            const walkY = (y - chartState.startY);
            
            // If moved more than 5 pixels, consider it a drag operation (not a click)
            if (Math.abs(walkX) > 5 || Math.abs(walkY) > 5) {
                chartState.isDragging = true;
            }

            viewport.scrollLeft = chartState.scrollLeft - walkX;
            viewport.scrollTop = chartState.scrollTop - walkY;
        });

        // Window resize handling to redraw lines
        window.addEventListener('resize', drawLines);
        
        // Initial Run
        renderChart();