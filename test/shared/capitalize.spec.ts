import { capitalize } from '@modules/shared/domain/utils/capitalize';

describe('capitalize', () => {
  it('should capitalize the first letter of a normal string', () => {
    // Arrange & Act & Assert
    expect(capitalize('hello')).toBe('Hello');
  });

  it('should capitalize a multi-word string (only first letter)', () => {
    // Arrange & Act & Assert
    expect(capitalize('hello world')).toBe('Hello world');
  });

  it('should return empty string for empty string input', () => {
    // Arrange & Act & Assert
    expect(capitalize('')).toBe('');
  });

  it('should return null for null input', () => {
    // Arrange & Act & Assert
    expect(capitalize(null as any)).toBeNull();
  });

  it('should return undefined for undefined input', () => {
    // Arrange & Act & Assert
    expect(capitalize(undefined as any)).toBeUndefined();
  });

  it('should handle a single character string', () => {
    // Arrange & Act & Assert
    expect(capitalize('a')).toBe('A');
  });

  it('should return unchanged string when already capitalized', () => {
    // Arrange & Act & Assert
    expect(capitalize('Hello')).toBe('Hello');
  });

  it('should handle string starting with a number', () => {
    // Arrange & Act & Assert
    expect(capitalize('123abc')).toBe('123abc');
  });

  it('should handle string with special characters', () => {
    // Arrange & Act & Assert
    expect(capitalize('!hello')).toBe('!hello');
  });

  it('should handle uppercase string', () => {
    // Arrange & Act & Assert
    expect(capitalize('HELLO')).toBe('HELLO');
  });
});
