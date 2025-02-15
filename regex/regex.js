const config = {
    minimum_length: 15,
    no_of_capital_letters: 5,
    no_of_special_characters: 3,
    no_of_numbers: 2,
    prefix: "NexGen",
    suffix: null,
    no_of_small_letters: 7,
    patterns_to_be_present: [],
    anti_patterns: []
  };
  
  function generateRegex(config) {
    const { prefix, suffix, minimum_length, no_of_capital_letters, no_of_small_letters, no_of_numbers, no_of_special_characters } = config;
  
    // Start with the prefix
    let regex = `^${prefix}`;
  
    // Add lookaheads for each character type (applied globally)
    regex += `(?=.*[A-Z]{${no_of_capital_letters},})`; // At least 'no_of_capital_letters' capital letters
    regex += `(?=.*[a-z]{${no_of_small_letters},})`; // At least 'no_of_small_letters' small letters
    regex += `(?=.*\\d{${no_of_numbers},})`; // At least 'no_of_numbers' numbers
    regex += `(?=.*[!@#$%^&*()_+\\-=\\[\\]{};':"\\\\|,.<>\\/?]{${no_of_special_characters},})`; // At least 'no_of_special_characters' special characters
  
    // Add the suffix if provided
    if (suffix) {
      regex += `.*${suffix}`;
    }
  
    // Ensure the total length is at least 'minimum_length'
    regex += `.{${minimum_length},}$`;
  
    return new RegExp(regex);
  }
  
  function validatePassword(password, regex) {
    return regex.test(password);
  }
  
  // Generate the regex
  const passwordRegex = generateRegex(config);
  
  // Test passwords
  const passwords = [
    "NexGenABCDEfghijkl123!@#", // Valid
    "NexGenXYZabcde12345!@#$",  // Invalid (fails capital and small letters)
    "NexGenABCDEfghij123!@#",   // Invalid (fails small letters)
    "NexGenABCDEfghijkl123",    // Invalid (fails special characters)
    "NexGenABCDEfghijkl!@#",    // Invalid (fails numbers)
    "NexGenABCDEfghijkl123!@#", // Valid
  ];
  
  // Test each password
  passwords.forEach((password, index) => {
    const isValid = validatePassword(password, passwordRegex);
    console.log(`Password ${index + 1}: "${password}" => ${isValid ? "Valid" : "Invalid"}`);
  });