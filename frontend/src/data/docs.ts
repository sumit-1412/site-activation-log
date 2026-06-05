import type { DocDefinition } from '../types';

export const DOCS: DocDefinition[] = [
  {
    "id": "d1",
    "name": "NDA / Data Security Agreement"
  },
  {
    "id": "d2",
    "name": "Facility List (Excel Template)"
  },
  {
    "id": "d3",
    "name": "Staff List (Excel Template)"
  },
  {
    "id": "d4",
    "name": "Shift Timing Schedule"
  },
  {
    "id": "d5",
    "name": "Paper Checklists (from client)"
  },
  {
    "id": "d6",
    "name": "QR Poster Design"
  },
  {
    "id": "d7",
    "name": "Training Attendance Sheet"
  },
  {
    "id": "d8",
    "name": "MOU / Pilot Agreement"
  }
];
export const MS_TEMPLATES = {
  "m7": [
    "facility"
  ],
  "m10": [
    "users"
  ]
} as Record<string, string[]>;
export const DOC_TEMPLATES = {
  "d2": [
    "facility"
  ],
  "d3": [
    "users"
  ]
} as Record<string, string[]>;
export const MS_DOC = {
  "m3": [
    "d8",
    "approved"
  ],
  "m4": [
    "d1",
    "approved"
  ],
  "m7": [
    "d2",
    "sent"
  ],
  "m8": [
    "d2",
    "received"
  ],
  "m9": [
    "d2",
    "approved"
  ],
  "m10": [
    "d3",
    "sent"
  ],
  "m11": [
    "d3",
    "received"
  ],
  "m13": [
    "d4",
    "received"
  ],
  "m14": [
    "d5",
    "received"
  ],
  "m26": [
    "d6",
    "sent"
  ],
  "m27": [
    "d6",
    "approved"
  ],
  "m39": [
    "d7",
    "received"
  ],
  "m40": [
    "d8",
    "approved"
  ]
} as Record<string, [string, string]>;
export const DOC_NAME = {
  "d1": "NDA",
  "d2": "Facility List",
  "d3": "Staff List",
  "d4": "Shift Schedule",
  "d5": "Checklists",
  "d6": "QR Design",
  "d7": "Attendance",
  "d8": "MOU"
} as Record<string, string>;
export const MS_ROLE = {
  "m7": "facility",
  "m8": "facility",
  "m9": "facility",
  "m10": "hr",
  "m11": "hr",
  "m13": "hr",
  "m14": "facility"
} as Record<string, string>;
