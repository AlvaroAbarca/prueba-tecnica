import { JsonbFilterField } from '@modules/shared/criteria/domain/jsonbFilterField';

describe('JsonbFilterField', () => {
  describe('Constructor and basic properties', () => {
    it('should create a JsonbFilterField with a simple path', () => {
      const field = new JsonbFilterField('attributes.typeCollectorGuide');

      expect(field.value()).toBe('attributes.typeCollectorGuide');
      expect(field.isJsonb).toBe(true);
      expect(field.path).toEqual(['attributes', 'typeCollectorGuide']);
    });

    it('should create a JsonbFilterField with a nested path', () => {
      const field = new JsonbFilterField('shipmentData.user.address.city');

      expect(field.value()).toBe('shipmentData.user.address.city');
      expect(field.path).toEqual(['shipmentData', 'user', 'address', 'city']);
    });

    it('should create a JsonbFilterField with no nested path', () => {
      const field = new JsonbFilterField('attributes');

      expect(field.value()).toBe('attributes');
      expect(field.path).toEqual(['attributes']);
    });
  });

  describe('getColumn', () => {
    it('should return the column name', () => {
      const field = new JsonbFilterField('attributes.typeCollectorGuide');
      expect(field.getColumn()).toBe('attributes');
    });

    it('should return the column name for nested paths', () => {
      const field = new JsonbFilterField('shipmentData.user.address.city');
      expect(field.getColumn()).toBe('shipmentData');
    });

    it('should return the column name when no path is specified', () => {
      const field = new JsonbFilterField('attributes');
      expect(field.getColumn()).toBe('attributes');
    });
  });

  describe('getJsonbPath', () => {
    it('should return the JSONB path without the column', () => {
      const field = new JsonbFilterField('attributes.typeCollectorGuide');
      expect(field.getJsonbPath()).toBe('typeCollectorGuide');
    });

    it('should return the JSONB path for nested structures', () => {
      const field = new JsonbFilterField('shipmentData.user.address.city');
      expect(field.getJsonbPath()).toBe('user.address.city');
    });

    it('should return null when there is no path', () => {
      const field = new JsonbFilterField('attributes');
      expect(field.getJsonbPath()).toBeNull();
    });
  });

  describe('getPathArray', () => {
    it('should return the path as an array without the column', () => {
      const field = new JsonbFilterField('attributes.typeCollectorGuide');
      expect(field.getPathArray()).toEqual(['typeCollectorGuide']);
    });

    it('should return the nested path as an array', () => {
      const field = new JsonbFilterField('shipmentData.user.address.city');
      expect(field.getPathArray()).toEqual(['user', 'address', 'city']);
    });

    it('should return an empty array when there is no path', () => {
      const field = new JsonbFilterField('attributes');
      expect(field.getPathArray()).toEqual([]);
    });
  });

  describe('hasJsonbPath', () => {
    it('should return true when there is a JSONB path', () => {
      const field = new JsonbFilterField('attributes.typeCollectorGuide');
      expect(field.hasJsonbPath()).toBe(true);
    });

    it('should return true for nested paths', () => {
      const field = new JsonbFilterField('shipmentData.user.address.city');
      expect(field.hasJsonbPath()).toBe(true);
    });

    it('should return false when there is no path', () => {
      const field = new JsonbFilterField('attributes');
      expect(field.hasJsonbPath()).toBe(false);
    });
  });

  describe('getDepth', () => {
    it('should return 1 for a simple path', () => {
      const field = new JsonbFilterField('attributes.typeCollectorGuide');
      expect(field.getDepth()).toBe(1);
    });

    it('should return 3 for a deeply nested path', () => {
      const field = new JsonbFilterField('shipmentData.user.address.city');
      expect(field.getDepth()).toBe(3);
    });

    it('should return 0 when there is no path', () => {
      const field = new JsonbFilterField('attributes');
      expect(field.getDepth()).toBe(0);
    });
  });

  describe('Edge cases', () => {
    it('should handle paths with special characters', () => {
      const field = new JsonbFilterField('data.user_name.first_name');
      expect(field.getColumn()).toBe('data');
      expect(field.getJsonbPath()).toBe('user_name.first_name');
      expect(field.getPathArray()).toEqual(['user_name', 'first_name']);
    });

    it('should handle very deep nesting', () => {
      const field = new JsonbFilterField('a.b.c.d.e.f.g');
      expect(field.getColumn()).toBe('a');
      expect(field.getDepth()).toBe(6);
      expect(field.getPathArray()).toEqual(['b', 'c', 'd', 'e', 'f', 'g']);
    });
  });
});
