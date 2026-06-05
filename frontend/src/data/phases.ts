import type { Phase } from '../types';

export const PHASES: Phase[] = [
  {
    "id": 1,
    "name": "Engagement",
    "milestones": [
      {
        "id": "m1",
        "label": "First meeting / demo",
        "owner": "humblx",
        "sla": null
      },
      {
        "id": "m2",
        "label": "Informal pilot approval received",
        "owner": "client",
        "sla": 24
      },
      {
        "id": "m3",
        "label": "Formal pilot agreement / MOU signed",
        "owner": "client",
        "sla": 72
      },
      {
        "id": "m4",
        "label": "NDA signed by both parties",
        "owner": "client",
        "sla": 240
      },
      {
        "id": "m5",
        "label": "WhatsApp support group created",
        "owner": "humblx",
        "sla": null
      }
    ]
  },
  {
    "id": 2,
    "name": "Discovery & Data Collection",
    "milestones": [
      {
        "id": "m6",
        "label": "Physical site survey completed",
        "owner": "humblx",
        "sla": null
      },
      {
        "id": "m7",
        "label": "Facility list format sent to client",
        "owner": "humblx",
        "sla": null
      },
      {
        "id": "m8",
        "label": "Facility list received from client",
        "owner": "client",
        "sla": 48
      },
      {
        "id": "m9",
        "label": "Facility list reviewed & approved internally",
        "owner": "humblx",
        "sla": null
      },
      {
        "id": "m10",
        "label": "Staff list format sent to client",
        "owner": "humblx",
        "sla": null
      },
      {
        "id": "m11",
        "label": "Staff list received from client",
        "owner": "client",
        "sla": 48
      },
      {
        "id": "m12",
        "label": "Shift timing format sent to client",
        "owner": "humblx",
        "sla": null
      },
      {
        "id": "m13",
        "label": "Shift timings received from client",
        "owner": "client",
        "sla": 48
      },
      {
        "id": "m14",
        "label": "Paper checklists received from client",
        "owner": "client",
        "sla": 72
      },
      {
        "id": "m15",
        "label": "Modules confirmed (HK / FM / Feedback)",
        "owner": "humblx",
        "sla": null
      }
    ]
  },
  {
    "id": 3,
    "name": "System Configuration",
    "milestones": [
      {
        "id": "m16",
        "label": "Buildings & floors configured",
        "owner": "humblx",
        "sla": null
      },
      {
        "id": "m17",
        "label": "Facility types created",
        "owner": "humblx",
        "sla": null
      },
      {
        "id": "m18",
        "label": "Facilities bulk uploaded",
        "owner": "humblx",
        "sla": null
      },
      {
        "id": "m19",
        "label": "Roles & permissions configured",
        "owner": "humblx",
        "sla": null
      },
      {
        "id": "m20",
        "label": "Users bulk uploaded",
        "owner": "humblx",
        "sla": null
      },
      {
        "id": "m21",
        "label": "Teams created & mapped",
        "owner": "humblx",
        "sla": null
      },
      {
        "id": "m22",
        "label": "Checklists digitized & uploaded",
        "owner": "humblx",
        "sla": null
      },
      {
        "id": "m23",
        "label": "Shifts created & facilities mapped",
        "owner": "humblx",
        "sla": null
      },
      {
        "id": "m24",
        "label": "Feedback forms configured",
        "owner": "humblx",
        "sla": null
      },
      {
        "id": "m25",
        "label": "Escalation & notification rules configured",
        "owner": "humblx",
        "sla": null
      }
    ]
  },
  {
    "id": 4,
    "name": "QR & Physical Setup",
    "milestones": [
      {
        "id": "m26",
        "label": "QR poster design shared with client",
        "owner": "humblx",
        "sla": null
      },
      {
        "id": "m27",
        "label": "Client approves QR design",
        "owner": "client",
        "sla": 48
      },
      {
        "id": "m28",
        "label": "Final QR count confirmed",
        "owner": "humblx",
        "sla": null
      },
      {
        "id": "m29",
        "label": "Sent to print",
        "owner": "humblx",
        "sla": null
      },
      {
        "id": "m30",
        "label": "QRs physically delivered to site",
        "owner": "humblx",
        "sla": null
      },
      {
        "id": "m31",
        "label": "QRs placed at all locations",
        "owner": "humblx",
        "sla": null
      }
    ]
  },
  {
    "id": 5,
    "name": "Validation & Training",
    "milestones": [
      {
        "id": "m32",
        "label": "Test run — inspections",
        "owner": "humblx",
        "sla": null
      },
      {
        "id": "m33",
        "label": "Test run — tickets",
        "owner": "humblx",
        "sla": null
      },
      {
        "id": "m34",
        "label": "Test run — reports & dashboard",
        "owner": "humblx",
        "sla": null
      },
      {
        "id": "m35",
        "label": "Test run — feedback (if applicable)",
        "owner": "humblx",
        "sla": null
      },
      {
        "id": "m36",
        "label": "Training date proposed by Humblx",
        "owner": "humblx",
        "sla": null
      },
      {
        "id": "m37",
        "label": "Client confirms training date & location",
        "owner": "client",
        "sla": 48
      },
      {
        "id": "m38",
        "label": "Training conducted (ground staff + supervisors)",
        "owner": "humblx",
        "sla": null
      },
      {
        "id": "m39",
        "label": "Attendance logged & absentees notified to client",
        "owner": "humblx",
        "sla": null
      },
      {
        "id": "m40",
        "label": "UAT sign-off from client PoC",
        "owner": "client",
        "sla": 48
      }
    ]
  },
  {
    "id": 6,
    "name": "Go-Live",
    "milestones": [
      {
        "id": "m41",
        "label": "Go-live date confirmed",
        "owner": "humblx",
        "sla": null
      },
      {
        "id": "m42",
        "label": "System live & active",
        "owner": "humblx",
        "sla": null
      },
      {
        "id": "m43",
        "label": "Client onboarded & trained",
        "owner": "humblx",
        "sla": null
      }
    ]
  },
  {
    "id": 7,
    "name": "Post Go-Live (30 Days)",
    "milestones": [
      {
        "id": "m44",
        "label": "First real inspection scan confirmed",
        "owner": "humblx",
        "sla": null
      },
      {
        "id": "m45",
        "label": "First ticket raised & resolved",
        "owner": "humblx",
        "sla": null
      },
      {
        "id": "m46",
        "label": "Week 1 check-in call with client PoC",
        "owner": "humblx",
        "sla": null
      },
      {
        "id": "m47",
        "label": "First dashboard review with management",
        "owner": "humblx",
        "sla": null
      },
      {
        "id": "m48",
        "label": "Issues/gaps logged & resolved",
        "owner": "humblx",
        "sla": null
      },
      {
        "id": "m49",
        "label": "Week 2 follow-up visit or call",
        "owner": "humblx",
        "sla": null
      },
      {
        "id": "m50",
        "label": "First feedback data reviewed with client",
        "owner": "humblx",
        "sla": null
      },
      {
        "id": "m51",
        "label": "30-day health review completed",
        "owner": "humblx",
        "sla": null
      }
    ]
  }
];
