import { defineConfig } from '@prisma/config';
import * as dotenv from 'dotenv'; // Change this line

dotenv.config();

export default defineConfig({
    datasource: {
        url: process.env.DATABASE_URL,
    },
});