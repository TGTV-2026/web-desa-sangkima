import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Desa Sangkima API",
      version: "1.0.0",
      description: "API documentation for Desa Sangkima web application",
      contact: {
        name: "API Support",
      },
    },
    servers: [
      {
        // Routes live under the /esurat prefix, so the documented `/api/...`
        // paths resolve against this base in Swagger "Try it out".
        url: "http://localhost:3000/esurat",
        description: "Development server",
      },
      ...(process.env.NEXT_PUBLIC_API_URL &&
      process.env.NEXT_PUBLIC_API_URL !== "http://localhost:3000"
        ? [
            {
              url: `${process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "")}/esurat`,
              description: "Production server",
            },
          ]
        : []),
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./src/app/esurat/api/**/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
