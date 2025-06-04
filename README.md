📝 StoryWeave

A real-time collaborative storytelling platform where multiple users create stories together, turn by turn.

🌐 Live Demo: story-weave-two.vercel.app

🚀 How to Use StoryWeave
Step 1: Create an Account
Visit story-weave-two.vercel.app and either:

Register a new account (you can use any email/username - it's just for demo!)
Login if you already have an account

<img width="552" alt="Screenshot 2025-06-03 at 11 16 34 PM" src="https://github.com/user-attachments/assets/502940e3-f567-4ca7-b9c1-be620319b8d0" />

Step 2: Choose Your Adventure
After logging in, you'll reach the Story Lobby where you can:
Option A: Create a New Story 🎨

Click "Create New Story"
Enter a story title
Choose a category (Fantasy, Sci-Fi, Mystery, etc.)
Select max participants (2-8 people)
Set turn limit (5-30 turns)
Click "Create Story"

<img width="827" alt="Screenshot 2025-06-03 at 11 23 55 PM" src="https://github.com/user-attachments/assets/4bb6008d-c227-4802-9995-4284bab2a396" />

Option B: Join an Existing Story 🎭

Browse available story sessions in the lobby
Click "Join Session" on any story that interests you
Start collaborating immediately!

<img width="1206" alt="Screenshot 2025-06-03 at 11 25 55 PM" src="https://github.com/user-attachments/assets/18613b0a-f911-4bb9-a47f-0ca8604bd0e9" />

Step 3: Collaborative Storytelling ✨
Once in a story session:

Wait for your turn - you'll see whose turn it is
When it's your turn, write 10-1000 characters to continue the story
Submit your contribution and watch the story grow!
See real-time updates as other participants add their parts

<img width="954" alt="Screenshot 2025-06-03 at 11 46 25 PM" src="https://github.com/user-attachments/assets/10f8cf89-1a0d-49bb-90b2-c37cd4bc64f9" />

Step 4: View Completed Stories 📚

Navigate to "Completed Stories" to read finished collaborations
Filter by category or search for specific stories
See who contributed to each story

<img width="1185" alt="Screenshot 2025-06-03 at 11 52 56 PM" src="https://github.com/user-attachments/assets/8be62533-f6e9-404f-b819-fb92839c9a59" />

🛠 Technical Features
Frontend

React.js with modern hooks and context
Socket.io for real-time collaboration
Styled Components for responsive design
React Router for seamless navigation

Backend

Node.js & Express REST API
Socket.io for real-time communication
JWT Authentication for secure user sessions
MongoDB for data persistence
Security middleware (Helmet, rate limiting, input validation)

Deployment

Frontend: Vercel
Backend: Railway
Database: MongoDB Atlas


🎯 Key Features
✅ Real-time collaboration - See updates instantly
✅ Turn-based storytelling - Organized, fair participation
✅ Multiple story categories - Fantasy, Sci-Fi, Mystery, Romance, Horror, Comedy
✅ User authentication - Secure login/registration
✅ Story history - Browse and read completed stories
✅ Responsive design - Works on desktop and mobile
✅ Live typing indicators - See when others are writing

🎪 Try It Out!
Want to test the real-time features?

Open the app in two different browsers (or one incognito window)
Register two different accounts
Create a story with one account
Join the story with the second account
Take turns writing and watch the magic happen! ✨


🔧 Local Development
bash# Clone the repository
git clone https://github.com/yourusername/StoryWeave.git

# Install dependencies
npm run install-all

# Start development servers
npm run dev
Environment Variables
Server (.env):
PORT=5002
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret
NODE_ENV=development
CLIENT_URL=http://localhost:3000
Client (.env):
REACT_APP_API_URL=http://localhost:5002
REACT_APP_SOCKET_URL=http://localhost:5002

📸 Screenshots Guide
Add screenshots in these locations:

After "Step 1" - Login/Register page
After "Option A" - Create Story form
After "Option B" - Lobby with story sessions
After "Step 3" - Active story session with real-time typing
After "Step 4" - Completed stories library
Optional: Mobile responsive views


🏆 About This Project
StoryWeave demonstrates full-stack development skills, including:

Real-time web applications
User authentication & authorization
Database design and management
Responsive UI/UX design
Production deployment and DevOps
Security best practices


🤝 Contributing
This is a portfolio project, but feel free to:

Report bugs via Issues
Suggest features
Fork and experiment!


📄 License
MIT License - feel free to use this project for learning!

Built with ❤️ by Hunter Walker | https://atravos.com | https://www.linkedin.com/in/hunterreesewalker/
