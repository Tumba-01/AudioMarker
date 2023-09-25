// app.js

function login() {
    // Get the entered username and password
    const username = document.querySelector('input[type="text"]').value;
    const password = document.querySelector('input[type="password"]').value;
  
    // Replace these with your actual username and password
    const expectedUsername = "admin";
    const expectedPassword = "admin";
  
    if (username === expectedUsername && password === expectedPassword) {
      // Hide the login form and show the content
      document.getElementById('loginDialog').style.display = 'none';
      document.getElementById('content').style.display = 'block';
      document.getElementById('header-box').style.display = 'block';
    } else {
      alert("Invalid username or password. Please try again.");
    }
  }


  function downloadFile() {
    // Create an anchor element
    const a = document.createElement('a');
    
    // Set the href to the download link
    a.href = 'https://docs.google.com/spreadsheets/d/1ezwXXfRFe-C2YkOG3llnFu7O3hPI19ZPjSfomePEJfY/edit?usp=sharing';
    
    a.setAttribute('target', '_blank');
    
    a.click();
  }
  