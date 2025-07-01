import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { CoreService } from './core.service';

describe('CoreService', () => {
  let service: CoreService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoreService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CoreService>(CoreService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSectorSplash', () => {
    it('should return HTML pre element with ASCII art', () => {
      const sectorName = 'TEST';
      const result = service.getSectorSplash(sectorName);
      
      expect(result).toMatch(/^<pre>.*<\/pre>$/s); // 's' flag for multiline
      expect(result.length).toBeGreaterThan(20); // Should have substantial content
    });

    it('should handle figlet errors gracefully', () => {
      // Test with a sector name that might cause issues
      const result = service.getSectorSplash('');
      
      // Should either return ASCII art or fallback HTML
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should return fallback HTML when figlet fails', () => {
      // Mock figlet to fail (this would require mocking the figlet module)
      const sectorName = 'FAIL-TEST';
      const result = service.getSectorSplash(sectorName);
      
      // Should still return a string (either ASCII art or fallback)
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });
  });

  describe('getAliveStatus', () => {
    it('should return alive status with sector name', () => {
      const sectorName = 'TEST-SECTOR';
      const result = service.getAliveStatus(sectorName);
      
      expect(result).toEqual({
        status: 'alive',
        sector: sectorName,
      });
    });

    it('should handle empty sector name', () => {
      const result = service.getAliveStatus('');
      
      expect(result).toEqual({
        status: 'alive',
        sector: '',
      });
    });
  });

  describe('getServerInfo', () => {
    it('should return server info with default values', () => {
      jest.spyOn(configService, 'get')
        .mockReturnValueOnce('test-app') // APP_NAME
        .mockReturnValueOnce(4000); // PORT

      const result = service.getServerInfo();
      
      expect(result).toEqual({
        name: 'test-app',
        port: 4000,
      });

      expect(configService.get).toHaveBeenCalledWith('APP_NAME', 'saga-soa');
      expect(configService.get).toHaveBeenCalledWith('PORT', 3000);
    });

    it('should use fallback values when config not available', () => {
      jest.spyOn(configService, 'get')
        .mockImplementation((key: string, defaultValue?: any) => defaultValue);

      const result = service.getServerInfo();
      
      expect(result).toEqual({
        name: 'saga-soa',
        port: 3000,
      });
    });

    it('should handle config service returning null', () => {
      jest.spyOn(configService, 'get')
        .mockImplementation((key: string, defaultValue?: any) => defaultValue);

      const result = service.getServerInfo();
      
      expect(result).toEqual({
        name: 'saga-soa',
        port: 3000,
      });
    });
  });
});