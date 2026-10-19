import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getApps, initializeApp, App, applicationDefault } from 'firebase-admin/app';
import { getAuth, DecodedIdToken } from 'firebase-admin/auth';

@Injectable()
export class FirebaseAdminService {
  private readonly logger = new Logger(FirebaseAdminService.name);
  private app: App | null = null;

  constructor(private readonly configService: ConfigService) {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    const existingApps = getApps();
    if (existingApps.length > 0 && existingApps[0]) {
      this.app = existingApps[0];
      return;
    }

    const projectId =
      this.configService.get<string>('FIREBASE_PROJECT_ID') ||
      process.env.GCP_PROJECT ||
      'companylab-erp-dev';

    const emulatorHost = this.configService.get<string>('FIREBASE_AUTH_EMULATOR_HOST');
    if (emulatorHost) {
      process.env.FIREBASE_AUTH_EMULATOR_HOST = emulatorHost;
      this.logger.log(`Using Firebase Auth Emulator at ${emulatorHost}`);
    }

    try {
      if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        this.app = initializeApp({
          credential: applicationDefault(),
          projectId,
        });
      } else {
        this.app = initializeApp({
          projectId,
        });
      }
      this.logger.log(`Initialized Firebase Admin for project: ${projectId}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Firebase Admin initialization warning: ${message}`);
    }
  }

  async verifyIdToken(token: string): Promise<DecodedIdToken> {
    if (!this.app) {
      throw new Error('Firebase Admin is not initialized');
    }
    return getAuth(this.app).verifyIdToken(token);
  }
}
