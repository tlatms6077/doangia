// src/utils/NotionUtils.ts
import { Client } from '@notionhq/client';

export class NotionUtils {
  private client: Client;

  constructor() {
    this.client = new Client({ auth: process.env.REACT_APP_NOTION_KEY });
  }

  async fetchDatabase(databaseId: string) {
    try {
      const response = await this.client.databases.query({ database_id: databaseId });
      return response.results;
    } catch (error) {
      console.error("Failed to fetch data from Notion:", error);
      throw new Error('Failed to fetch data');
    }
  }
}
