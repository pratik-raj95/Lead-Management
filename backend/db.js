import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'data', 'db.json');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initial seed data for demonstration
const defaultData = [
  {
    id: "lead_1",
    phone: "9876543210",
    source: "meta_ads",
    status: "New Leads",
    createdDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    followUpDate: null
  },
  {
    id: "lead_2",
    phone: "9988776655",
    source: "whatsapp",
    status: "Interested",
    createdDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    followUpDate: new Date().toISOString().split('T')[0] // Today's follow up
  },
  {
    id: "lead_3",
    phone: "9123456789",
    source: "google_ads",
    status: "Follow Up",
    createdDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    followUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // In 2 days
  },
  {
    id: "lead_4",
    phone: "9876123450",
    source: "meta_ads",
    status: "Not Interested",
    createdDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    followUpDate: null
  }
];

class Database {
  constructor() {
    this.leads = [];
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(DB_PATH)) {
        const data = fs.readFileSync(DB_PATH, 'utf8');
        this.leads = JSON.parse(data);
      } else {
        this.leads = defaultData;
        this.save();
      }
    } catch (error) {
      console.error('Error loading database, using default data:', error);
      this.leads = defaultData;
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(this.leads, null, 2), 'utf8');
    } catch (error) {
      console.error('Error saving database:', error);
    }
  }

  getLeads() {
    return this.leads;
  }

  getLeadById(id) {
    return this.leads.find(l => l.id === id);
  }

  addLead(phone, source) {
    const newLead = {
      id: `lead_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      phone: phone,
      source: source,
      status: "New Leads",
      createdDate: new Date().toISOString(),
      followUpDate: null
    };
    this.leads.push(newLead);
    this.save();
    return newLead;
  }

  updateLead(id, updates) {
    const index = this.leads.findIndex(l => l.id === id);
    if (index !== -1) {
      this.leads[index] = {
        ...this.leads[index],
        ...updates
      };
      this.save();
      return this.leads[index];
    }
    return null;
  }
}

export const db = new Database();
