import { Test, TestingModule } from "@nestjs/testing";
import { LoggerModule } from "../logger.module";
import { LoggerService } from "../logger.service";
import type { ILogger } from "../../i-logger";

describe("LoggerModule", () => {
  let module: TestingModule;
  let loggerService: LoggerService;
  let iLogger: ILogger;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        LoggerModule.forRoot({
          config: {
            configType: "PINO_LOGGER",
            level: "debug",
            prettyPrint: false,
            isExpressContext: false,
          },
        }),
      ],
    }).compile();

    loggerService = module.get<LoggerService>(LoggerService);
    iLogger = module.get<ILogger>("ILogger");
  });

  afterEach(async () => {
    if (module) {
      await module.close();
    }
  });

  it("should be defined", () => {
    expect(loggerService).toBeDefined();
    expect(iLogger).toBeDefined();
  });

  it("should provide LoggerService as ILogger", () => {
    expect(iLogger).toBe(loggerService);
  });

  it("should implement ILogger interface", () => {
    expect(typeof loggerService.info).toBe("function");
    expect(typeof loggerService.warn).toBe("function");
    expect(typeof loggerService.error).toBe("function");
    expect(typeof loggerService.debug).toBe("function");
  });

  it("should log messages without throwing", () => {
    expect(() => {
      loggerService.info("Test info message");
      loggerService.warn("Test warn message");
      loggerService.debug("Test debug message");
      loggerService.error("Test error message", new Error("test error"));
    }).not.toThrow();
  });

  it("should handle structured data", () => {
    expect(() => {
      loggerService.info("Test with data", { key: "value" });
      loggerService.warn("Test with data", { key: "value" });
      loggerService.debug("Test with data", { key: "value" });
      loggerService.error("Test with error and data", new Error("test"), { key: "value" });
    }).not.toThrow();
  });
});

describe("LoggerModule.forRootAsync", () => {
  let module: TestingModule;

  afterEach(async () => {
    if (module) {
      await module.close();
    }
  });

  it("should work with async configuration", async () => {
    module = await Test.createTestingModule({
      imports: [
        LoggerModule.forRootAsync({
          useFactory: () => ({
            configType: "PINO_LOGGER",
            level: "info",
            prettyPrint: true,
            isExpressContext: false,
          }),
        }),
      ],
    }).compile();

    const loggerService = module.get<LoggerService>(LoggerService);
    expect(loggerService).toBeDefined();
  });
});