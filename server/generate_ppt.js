const pptxgen = require('pptxgenjs');
let pres = new pptxgen();

// Global layout & styling
pres.layout = 'LAYOUT_16x9';

// Add Master Slide for consistent design
pres.defineSlideMaster({
    title: 'MASTER_SLIDE',
    background: { color: '0F172A' }, // Slate 900
    objects: [
        { line: { x: 0.5, y: 0.8, w: '90%', h: 0, line: { color: '334155', width: 1 } } }, // Top accent line
        { line: { x: 0.5, y: 5.0, w: '90%', h: 0, line: { color: '334155', width: 1 } } }, // Bottom accent line
        { text: { text: "TicketFlow Support System", options: { x: 0.5, y: 5.1, w: '30%', fontSize: 10, color: '64748B' } } },
        { text: { text: "Confidential & Internal", options: { x: 7.0, y: 5.1, w: '25%', align: 'right', fontSize: 10, color: '64748B' } } }
    ]
});

// Helper for Slide Title
const addTitle = (slide, text) => {
    slide.addText(text, { x: 0.5, y: 0.3, w: '80%', fontSize: 32, bold: true, color: '38BDF8' }); // Light Blue 400
};

// --- Slide 1: Welcome / Title ---
let s1 = pres.addSlide();
s1.background = { color: '0F172A' };
s1.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: '10%', h: '100%', fill: { color: '0369A1' } }); // Left banner
s1.addText("TicketFlow", { x: 1.5, y: 2.0, w: "80%", fontSize: 60, bold: true, color: 'E0F2FE' });
s1.addText("Next-Generation MERN Support Ticket System", { x: 1.5, y: 3.2, w: "80%", fontSize: 24, color: '94A3B8' });
s1.addText("Robust. Scalable. Real-Time.", { x: 1.5, y: 3.8, w: "80%", fontSize: 18, color: '38BDF8', italic: true });

// --- Slide 2: The Problem & Solution ---
let s2 = pres.addSlide({ masterName: 'MASTER_SLIDE' });
addTitle(s2, "The Problem & Our Solution");
s2.addText("The Problem", { x: 0.5, y: 1.2, fontSize: 22, bold: true, color: 'EF4444' }); // Red
s2.addText(
    "• Existing support software is overly complex & cluttered.\n• Enterprise tiers are extremely expensive.\n• Lack of seamless real-time notifications out of the box.",
    { x: 0.5, y: 1.7, w: "40%", h: 2, fontSize: 16, color: 'CBD5E1', bullet: true }
);
s2.addText("Our Solution (TicketFlow)", { x: 5.0, y: 1.2, fontSize: 22, bold: true, color: '22C55E' }); // Green
s2.addText(
    "• A streamlined, intuitive dark-mode interface.\n• Built purely on open-source (MERN).\n• Lightning-fast WebSockets for live updates.\n• Intelligent SLA tracking & workload mapping.",
    { x: 5.0, y: 1.7, w: "45%", h: 2, fontSize: 16, color: 'CBD5E1', bullet: true }
);

// --- Slide 3: High-Level Architecture ---
let s3 = pres.addSlide({ masterName: 'MASTER_SLIDE' });
addTitle(s3, "High-Level Architecture");
// Diagram mock using shapes
s3.addShape(pres.ShapeType.rect, { x: 1.0, y: 1.5, w: 2.5, h: 2.5, fill: { color: '1E293B' }, line: { color: '38BDF8', width: 2 } });
s3.addText("React Frontend", { x: 1.0, y: 2.5, w: 2.5, align: "center", fontSize: 20, bold: true, color: '61DAFB' });

s3.addShape(pres.ShapeType.rightArrow, { x: 3.8, y: 2.5, w: 0.8, h: 0.4, fill: { color: '475569' } });

s3.addShape(pres.ShapeType.rect, { x: 5.0, y: 1.5, w: 2.5, h: 2.5, fill: { color: '1E293B' }, line: { color: '22C55E', width: 2 } });
s3.addText("Node/Express Backend", { x: 5.0, y: 2.3, w: 2.5, align: "center", fontSize: 18, bold: true, color: '22C55E' });
s3.addText("+ Socket.IO", { x: 5.0, y: 2.7, w: 2.5, align: "center", fontSize: 14, color: '94A3B8' });

s3.addShape(pres.ShapeType.cloud, { x: 7.8, y: 1.5, w: 2.0, h: 2.5, fill: { color: '1E293B' }, line: { color: 'F59E0B', width: 2 } });
s3.addText("MongoDB", { x: 7.8, y: 2.5, w: 2.0, align: "center", fontSize: 18, bold: true, color: '47A248' });

// --- Slide 4: React Frontend Deep Dive ---
let s4 = pres.addSlide({ masterName: 'MASTER_SLIDE' });
addTitle(s4, "React & Vite Frontend");
s4.addText("Key Technologies:", { x: 0.5, y: 1.0, fontSize: 20, bold: true, color: 'E2E8F0' });
s4.addText("const App = () => {\n  return (\n    <AuthProvider>\n      <SocketProvider>\n        <Router />\n      </SocketProvider>\n    </AuthProvider>\n  )\n}", { x: 5.0, y: 1.0, w: 4.5, h: 3.5, fill: { color: '1E293B' }, color: '38BDF8', fontSize: 14, fontFace: "Courier New" });
s4.addText(
    "• Vite Compiler: Superfast HMR, optimized builds.\n• Context API: Global state without Redux overhead (AuthContext, SocketContext).\n• Modular Components: Separated into layout, pages, ui, and feature boundaries.\n• Dynamic Styling: Custom dark theme with CSS Grid & Flexbox.",
    { x: 0.5, y: 1.5, w: "4.5", h: 2.5, fontSize: 15, color: 'CBD5E1', bullet: true }
);

// --- Slide 5: Real-time Socket.IO Integration ---
let s5 = pres.addSlide({ masterName: 'MASTER_SLIDE' });
addTitle(s5, "Real-Time WebSocket Engine");
s5.addText("Why WebSockets?", { x: 0.5, y: 1.0, fontSize: 20, bold: true, color: 'E2E8F0' });
s5.addText(
    "HTTP is stateless. For a support system, refreshing to see new messages is unacceptable. We bridge the server-client gap seamlessly.",
    { x: 0.5, y: 1.4, w: "90%", fontSize: 16, color: '94A3B8' }
);
// Mock terminal output
s5.addShape(pres.ShapeType.rect, { x: 0.5, y: 2.2, w: 9.0, h: 2.0, fill: { color: '000000' } });
s5.addText("[Socket.IO] User admin@demo.com connected (ID: zX9_23k)\n[Socket.IO] Joined room: ticket_64f1A...\n[Event] Emitting 'new_comment' to room ticket_64f1A...\n[Event] Emitting 'typing_indicator' to Agent channel", { x: 0.6, y: 2.3, w: 8.8, h: 1.8, fontSize: 14, color: 'A3E635', fontFace: "Courier New" });

// --- Slide 6: Backend Node.js & Express API ---
let s6 = pres.addSlide({ masterName: 'MASTER_SLIDE' });
addTitle(s6, "Node.js & Express Architecture");
s6.addText("RESTful API & Middleware", { x: 0.5, y: 1.0, fontSize: 20, bold: true, color: 'E2E8F0' });
s6.addText(
    "• Security-First: JWT access & refresh tokens.\n• Validation: Strict schema sanitization to prevent NoSQL injection.\n• File Handling: Multer implementation for drag & drop file attachments.\n• Advanced Routing: Controller-Service-Route architecture separation.",
    { x: 0.5, y: 1.5, w: "90%", h: 2, fontSize: 16, color: 'CBD5E1', bullet: true }
);
// Endpoint examples
s6.addShape(pres.ShapeType.rect, { x: 0.5, y: 3.5, w: 2.8, h: 0.8, fill: { color: '3B82F6' }, align: 'center' });
s6.addText("GET /api/tickets\nFiltering, Pagination", { x: 0.5, y: 3.6, w: 2.8, fontSize: 14, color: 'FFFFFF', align: 'center', bold: true });

s6.addShape(pres.ShapeType.rect, { x: 3.6, y: 3.5, w: 2.8, h: 0.8, fill: { color: '10B981' }, align: 'center' });
s6.addText("PUT /api/tickets/:id\nUpdate Status & SLA", { x: 3.6, y: 3.6, w: 2.8, fontSize: 14, color: 'FFFFFF', align: 'center', bold: true });

s6.addShape(pres.ShapeType.rect, { x: 6.7, y: 3.5, w: 2.8, h: 0.8, fill: { color: '8B5CF6' }, align: 'center' });
s6.addText("POST /api/users/auth\nToken Rotation", { x: 6.7, y: 3.6, w: 2.8, fontSize: 14, color: 'FFFFFF', align: 'center', bold: true });

// --- Slide 7: MongoDB & Schema Integration ---
let s7 = pres.addSlide({ masterName: 'MASTER_SLIDE' });
addTitle(s7, "Database: MongoDB Integration");
s7.addText("Schema Relationships", { x: 0.5, y: 1.0, fontSize: 20, bold: true, color: 'E2E8F0' });
s7.addText("In MongoDB Native JSON format, our collections interact gracefully via ObjectIds:", { x: 0.5, y: 1.4, w: "90%", fontSize: 14, color: '94A3B8' });

// JSON mock 1
s7.addShape(pres.ShapeType.rect, { x: 0.5, y: 1.8, w: 4.2, h: 2.5, fill: { color: '1E293B' }, line: { color: '475569', width: 2 } });
s7.addText("// TICKETS COLLECTION\n{\n  _id: '64f..1',\n  title: 'Server Error',\n  requester: ObjectId('...'),\n  agent: ObjectId('...'),\n  status: 'In Progress'\n}", { x: 0.6, y: 1.9, w: 4.0, h: 2.3, fontSize: 13, color: '47A248', fontFace: "Courier New" });

// JSON mock 2
s7.addShape(pres.ShapeType.rect, { x: 5.3, y: 1.8, w: 4.2, h: 2.5, fill: { color: '1E293B' }, line: { color: '475569', width: 2 } });
s7.addText("// USERS COLLECTION\n{\n  _id: '...', \n  role: 'Agent',\n  activeTickets: 4, // Workload limit\n  slaBreaches: 0\n}", { x: 5.4, y: 1.9, w: 4.0, h: 2.3, fontSize: 13, color: '47A248', fontFace: "Courier New" });

// --- Slide 8: Enterprise Dashboard UI ---
let s8 = pres.addSlide({ masterName: 'MASTER_SLIDE' });
addTitle(s8, "Enterprise Analytics Dashboard");
// Mocking UI layout wireframe
s8.addShape(pres.ShapeType.rect, { x: 0.5, y: 1.2, w: 9, h: 3.5, fill: { color: '0F172A' }, line: { color: '334155', width: 2 } }); // Window
s8.addShape(pres.ShapeType.rect, { x: 0.5, y: 1.2, w: 2, h: 3.5, fill: { color: '1E293B' } }); // Sidebar
s8.addText("Dashboard\nTickets\nNetwork\nSettings", { x: 0.6, y: 1.5, w: 1.8, fontSize: 12, color: '94A3B8', breakLine: true });

// Top widgets
s8.addShape(pres.ShapeType.rect, { x: 2.8, y: 1.4, w: 1.8, h: 0.8, fill: { color: '1E293B' }, line: { color: '22C55E', width: 1 } });
s8.addText("New Tickets\n1,452", { x: 2.8, y: 1.5, w: 1.8, align: "center", fontSize: 14, color: '22C55E', bold: true });

s8.addShape(pres.ShapeType.rect, { x: 5.0, y: 1.4, w: 1.8, h: 0.8, fill: { color: '1E293B' }, line: { color: 'F59E0B', width: 1 } });
s8.addText("Avg Response\n1.2 Hrs", { x: 5.0, y: 1.5, w: 1.8, align: "center", fontSize: 14, color: 'F59E0B', bold: true });

s8.addShape(pres.ShapeType.rect, { x: 7.2, y: 1.4, w: 1.8, h: 0.8, fill: { color: '1E293B' }, line: { color: 'EF4444', width: 1 } });
s8.addText("Critial SLAs\n4", { x: 7.2, y: 1.5, w: 1.8, align: "center", fontSize: 14, color: 'EF4444', bold: true });

// Graph area mock
s8.addShape(pres.ShapeType.rect, { x: 2.8, y: 2.4, w: 6.2, h: 2.0, fill: { color: '1E293B' } });
s8.addText("[ Dynamic Chart.js Analytics Visualization ]", { x: 2.8, y: 3.2, w: 6.2, align: "center", fontSize: 14, color: '64748B', italic: true });


// --- Slide 9: Intelligent Workload / Logic ---
let s9 = pres.addSlide({ masterName: 'MASTER_SLIDE' });
addTitle(s9, "Intelligent Under-The-Hood Algorithms");
s9.addText("Agent Assignment Algorithm (Round Robin)", { x: 0.5, y: 1.0, fontSize: 20, bold: true, color: 'E2E8F0' });
s9.addText("System checks all Agents → Filters by 'Online' → Sorts by current workload → Assigns ticket to lightest workload.", { x: 0.5, y: 1.4, w: "90%", fontSize: 14, color: '94A3B8' });

s9.addText("Dynamic SLA Calculation Logic", { x: 0.5, y: 2.2, fontSize: 20, bold: true, color: 'E2E8F0' });
s9.addShape(pres.ShapeType.rect, { x: 0.5, y: 2.6, w: 9, h: 1.8, fill: { color: '1E293B' } });
s9.addText("• CRITICAL Priority → Resolves in 2 hours.\n• HIGH Priority → Resolves in 8 hours.\n• MEDIUM Priority → Resolves in 24 hours.\n• LOW Priority → Resolves in 72 hours.\n* Node server cron-jobs automatically flag/breach tickets nearing expiry.", { x: 0.6, y: 2.7, w: 8.8, h: 1.5, fontSize: 15, color: 'EF4444', bullet: true });

// --- Slide 10: Conclusion & Next Steps ---
let s10 = pres.addSlide({ masterName: 'MASTER_SLIDE' });
addTitle(s10, "Summary & Next Steps");
s10.addText("Achieved Scope:", { x: 0.5, y: 1.2, fontSize: 22, bold: true, color: '22C55E' });
s10.addText("• Full authentication, encryption, & JWT lifecycle.\n• Sophisticated multi-user real-time interaction.\n• Complete Admin panel & metric visualization.", { x: 0.5, y: 1.7, w: "90%", fontSize: 16, color: 'CBD5E1', bullet: true });

s10.addText("Future Roadmap:", { x: 0.5, y: 2.7, fontSize: 22, bold: true, color: '38BDF8' });
s10.addText("• Multi-language support mapping (i18n).\n• Agent sentiment analysis using open-source AI models.\n• Seamless ticketing via email parsing (SMTP integration).", { x: 0.5, y: 3.2, w: "90%", fontSize: 16, color: 'CBD5E1', bullet: true });

// Save
const outputPath = "../TicketFlow_Pro_Presentation.pptx";
pres.writeFile({ fileName: outputPath }).then(() => {
    console.log("PPTX Generation complete: " + outputPath);
});
