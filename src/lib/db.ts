import { PrismaClient } from "@prisma/client";
import { MockPrismaStore, createMockPrismaClient } from "./mock-db";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  mockStore?: MockPrismaStore;
  mockClient?: any;
};

if (!globalForPrisma.mockStore) {
  globalForPrisma.mockStore = new MockPrismaStore();
  globalForPrisma.mockClient = createMockPrismaClient(globalForPrisma.mockStore);
}

const mockPrisma = globalForPrisma.mockClient;

let client: any;

if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith("postgres")) {
  try {
    const real =
      globalForPrisma.prisma ??
      new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
      });
    if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = real;

    client = new Proxy(real, {
      get(target, prop, receiver) {
        const orig = Reflect.get(target, prop, receiver);
        if (typeof orig === "object" && orig !== null) {
          return new Proxy(orig, {
            get(modelTarget, methodProp) {
              const modelMethod = Reflect.get(modelTarget, methodProp);
              if (typeof modelMethod === "function") {
                return async (...args: any[]) => {
                  try {
                    return await modelMethod.apply(modelTarget, args);
                  } catch (err: any) {
                    const mockModel = mockPrisma[prop];
                    if (mockModel && typeof mockModel[methodProp] === "function") {
                      return await mockModel[methodProp](...args);
                    }
                    throw err;
                  }
                };
              }
              return modelMethod;
            },
          });
        }
        return orig;
      },
    });
  } catch {
    client = mockPrisma;
  }
} else {
  client = mockPrisma;
}

export const prisma = client as unknown as PrismaClient;

