// Test file to isolate import issues
console.log('Testing imports...');

try {
  // Test basic imports first
  import('./services/aiSystemBootstrap.js')
    .then(module => {
      console.log('aiSystemBootstrap imported successfully:', module);
    })
    .catch(error => {
      console.error('Error importing aiSystemBootstrap:', error);
    });
} catch (error) {
  console.error('Syntax error in test-import:', error);
}