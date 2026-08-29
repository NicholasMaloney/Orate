import "dotenv/config";
import {
    defineConfig,
    env,
} from "prisma/config";

export default defineConfig({
    // Tells Prisma where the schema and future migrations live.
    schema: "prisma/schema.prisma",

    migrations: {
        path: "prisma/migrations",
    },

    // Loads the local or container-provided PostgreSQL connection string.
    datasource: {
        url: env("DATABASE_URL"),
    },
});