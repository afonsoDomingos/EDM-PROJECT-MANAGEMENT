import dns from 'node:dns';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Resolve SRV records reliably on Windows environments
dns.setServers(['8.8.8.8', '1.1.1.1']);
import {
  ProjectModel,
  TaskModel,
  RiskModel,
  ExpenseModel,
  MilestoneModel,
  DocumentModel,
  AuditLogModel,
  NotificationModel,
  UserModel,
} from './models.js';
import {
  INITIAL_PROJECTS,
  INITIAL_TASKS,
  INITIAL_RISKS,
  INITIAL_EXPENSES,
  INITIAL_MILESTONES,
  INITIAL_DOCUMENTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS,
  INITIAL_USERS,
} from '../src/data/initialData.js';

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://karinganastudio23:VIbemongodb@cluster0.oe0akin.mongodb.net/edmprojectmanagementdb?retryWrites=true&w=majority';

export async function connectDB() {
  try {
    console.log('⚡ A ligar ao MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log('✅ Conexão ao MongoDB Atlas estabelecida com sucesso!');

    // Check and seed initial data if database is empty
    await seedDatabaseIfEmpty();
  } catch (error) {
    console.error('❌ Erro na conexão com o MongoDB Atlas:', error);
    // Don't crash process, allows server to respond with error status if needed
  }
}

export async function seedDatabase(force = false) {
  try {
    console.log('🌱 A semear dados no MongoDB Atlas...');
    if (force) {
      await Promise.all([
        ProjectModel.deleteMany({}),
        TaskModel.deleteMany({}),
        RiskModel.deleteMany({}),
        ExpenseModel.deleteMany({}),
        MilestoneModel.deleteMany({}),
        DocumentModel.deleteMany({}),
        AuditLogModel.deleteMany({}),
        NotificationModel.deleteMany({}),
        UserModel.deleteMany({}),
      ]);
    }

    await Promise.all([
      ProjectModel.insertMany(INITIAL_PROJECTS),
      TaskModel.insertMany(INITIAL_TASKS),
      RiskModel.insertMany(INITIAL_RISKS),
      ExpenseModel.insertMany(INITIAL_EXPENSES),
      MilestoneModel.insertMany(INITIAL_MILESTONES),
      DocumentModel.insertMany(INITIAL_DOCUMENTS),
      AuditLogModel.insertMany(INITIAL_AUDIT_LOGS),
      NotificationModel.insertMany(INITIAL_NOTIFICATIONS),
      UserModel.insertMany(INITIAL_USERS),
    ]);

    console.log('🎉 Dados de demonstração EDM semeados com sucesso no MongoDB Atlas!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao semear dados no MongoDB:', error);
    return false;
  }
}

async function seedDatabaseIfEmpty() {
  try {
    const projectCount = await ProjectModel.countDocuments();
    if (projectCount === 0) {
      console.log('📦 Base de dados vazia detectada. A inicializar os 14 projectos e entidades associadas...');
      await seedDatabase(false);
    } else {
      console.log(`📊 Base de dados já contém ${projectCount} projectos registados.`);
    }
  } catch (err) {
    console.error('Erro ao verificar documentos existentes:', err);
  }
}
