# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Features
- User Registration and Authentication: Users can create an account, login, and logout. Passwords are securely hashed using bcryptjs.
- URL Shortening: Users can enter a long URL and receive a shortened URL that redirects to the original long URL.
- URL Management: Users can view, edit, and delete their shortened URLs.
- Acccess Control: Only authenticated users can create, view, edit or delete their own      URLs. Unauthenticated users can still visit the shortnened URLs.

## Final Product

!["screenshot of urls page"](https://github.com/boggulasatya/tinyapp/blob/main/docs/urls-page.jpg?raw=true)
!["Screenshot of Register page"](https://github.com/boggulasatya/tinyapp/blob/main/docs/Register-page.jpg?raw=true)
!["Screenshot of newurl page"](https://github.com/boggulasatya/tinyapp/blob/main/docs/newurl-page.jpg?raw=true)

## Dependencies

- Node.js: A JavaScript runtime environment that allows executing JavaScript code   outside of a web browser.
- Express: A web application framework for Node.js that simplifies process of building web applications.
- EJS: A templating language that allows embedding JavaScript code in HTML templates for dynamic rendering.
- bcryptjs: A library for hashing passwords securely.
- cookie-session: A middleware that enables server-side session management using encrypted cookies.
These dependecies need to be installed before running the application.

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command. This will start the server, and you should see a message indicating that the server is running and listening on a specific port(`Listening on port 3000`).
- Open a web browser and navigate to `http://localhost:3000` (or the appropriate port number). This will take you to the TinyApp application.
Now you can register an account, login, and start shortening and managing your URLs using the TinyApp web interface.

### Shortening URLs
To shorten a long URL using TinyApp, follow these steps:
1. Register an account by clicking on the "Register" link and filling out the registration form.
2. After registering, you will be logged in automatically. 
3. On the TinyApp home page, enter a long URL into the input field and click the "submit" button.
4. You will see a shortened version of your URL appear below. You can copy and share this shortened URL with others.

### Managing Shortnened URLs
If you want to view, edit, or delete your shortened URLs, follow these steps:
1. Make sure you are logged in to your TinyApp account.
2. Click on the "My URLs" link in the navigation menu. This will take you to a page where you can see all your shortened URLs.
3. From this page, you can edit or delete any of your URLs as needed.




