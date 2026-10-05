# Dinner, Sorted

Dinner, Sorted is a full-stack meal planning application designed for busy individuals and families who want to spend less time figuring out dinner and more time enjoying it.

Users can search for recipes, view recipe details, and organize meals into personalized weekly meal plans. The application combines recipe data from TheMealDB with a Flask and PostgreSQL backend so authenticated users can create and manage meal plans that persist between sessions.

This project was built as my second capstone project for the Flatiron School Software Engineering program. It expands on my original React recipe application by adding a backend, relational database, user authentication, authorization, and full CRUD functionality.

## Technologies

### Frontend

- React
- React Router
- Vite
- JavaScript
- CSS
- TheMealDB API

### Backend

- Python
- Flask
- SQLAlchemy
- Flask-Migrate
- PostgreSQL
- Pipenv
- Session-based authentication

## Core Features

### Recipe Search

Users can search TheMealDB for recipes and browse the results in a responsive recipe grid.

A successful search is preserved during the current browser session so users can return to their recipe results after viewing recipe details or navigating to their meal plans.

### Recipe Details

Each recipe includes:

- Recipe image
- Category
- Cuisine
- Dynamically generated ingredient and measurement list
- Step-by-step cooking instructions
- Embedded YouTube recipe video when available

### User Authentication

Users can:

- Create an account
- Log in
- Log out
- Maintain an authenticated session

Meal planning features are protected so users must be logged in to access and modify their saved meal plans.

### Meal Plan Management

Authenticated users can:

- Create meal plans
- View their meal plans
- Rename meal plans
- Delete meal plans

Each meal plan belongs to the authenticated user. Backend authorization prevents users from updating or deleting another user's meal plans.

### Weekly Meal Planning

Users can add recipes to one or more available days of the week.

The weekly planner supports:

- Monday through Sunday planning
- Prevention of multiple meals being assigned to the same day
- Adding one recipe to multiple available days
- Removing planned meals
- Copying a meal to another open day
- Moving meals between days
- Swapping meals when the destination day is occupied
- Desktop drag-and-drop
- Mobile-friendly Move/Swap controls
- Persistence through PostgreSQL

The application also remembers the user's active meal plan during the current browser session.

## Data Model

Dinner, Sorted uses three related database models.

### User

A user has many meal plans.

### MealPlan

A meal plan belongs to a user and has many planned meals.

### PlannedMeal

A planned meal belongs to a meal plan and stores the recipe information needed for a specific day of the week.

The relationships are:

```text
User
  └── has many MealPlans
        └── has many PlannedMeals
```

## API

### External API

Recipe data comes from TheMealDB:

```text
https://www.themealdb.com/api/json/v1/1
```

The application uses TheMealDB to search for recipes and retrieve individual recipe details.

### Backend API

The Flask backend provides RESTful routes for:

- Authentication
- Meal plan CRUD operations
- Planned meal CRUD operations
- Moving and swapping planned meals

Meal plan GET requests support pagination.

## Project Structure

```text
dinner-sorted-fullstack/
├── client/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── constants/
│   │   ├── context/
│   │   ├── pages/
│   │   └── services/
│   └── package.json
├── server/
│   ├── migrations/
│   ├── models/
│   ├── routes/
│   ├── app.py
│   ├── extensions.py
│   ├── Pipfile
│   └── Pipfile.lock
└── README.md
```

The frontend is organized so that page-level components coordinate each screen, reusable components handle focused interface features, services handle API communication, context handles authentication state, and shared constants keep repeated values in one place.

The backend separates application setup, database models, and route logic into focused modules.

## Local Setup

### Prerequisites

Make sure the following are installed:

- Node.js
- npm
- Python 3
- Pipenv
- PostgreSQL

### 1. Clone the Repository

```bash
git clone https://github.com/melissagrace74/dinner-sorted-fullstack.git
cd dinner-sorted-fullstack
```

### 2. Create the PostgreSQL Database

Create a PostgreSQL database named:

```text
dinner_sorted
```

For example:

```bash
createdb dinner_sorted
```

### 3. Configure the Backend Environment

Navigate to the server directory:

```bash
cd server
```

Create a `.env` file containing:

```env
DATABASE_URL=postgresql://YOUR_POSTGRES_USER@localhost/dinner_sorted
SECRET_KEY=YOUR_SECRET_KEY
```

Replace `YOUR_POSTGRES_USER` with your PostgreSQL username and `YOUR_SECRET_KEY` with your own secret key.

The `.env` file contains local configuration and should not be committed to Git.

### 4. Install Backend Dependencies

From the `server` directory, install the dependencies from the Pipfile:

```bash
pipenv install
```

Enter the project's virtual environment:

```bash
pipenv shell
```

Apply the database migrations:

```bash
flask db upgrade
```

Start the Flask server:

```bash
python app.py
```

The backend runs locally at:

```text
http://localhost:5555
```

### 5. Install Frontend Dependencies

Open another terminal and navigate to the client directory from the project root:

```bash
cd client
```

Install the frontend dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

The frontend runs locally at:

```text
http://localhost:5173
```

## Code Quality Checks

From the `client` directory, run the frontend linter with:

```bash
npm run lint
```

Create a production build with:

```bash
npm run build
```

## Authentication and Authorization

Dinner, Sorted uses session-based authentication.

The backend verifies the authenticated user before allowing access to protected meal plan data. Meal plans are associated with their owner through the database, and update and delete operations verify ownership on the server rather than relying only on frontend protection.

## Responsive Design

The interface is designed for both desktop and mobile use.

Desktop users can rearrange meals with drag-and-drop, while mobile users have explicit Move/Swap controls so the same meal-planning functionality remains accessible without relying on drag-and-drop gestures.

## Future Improvements

One future improvement would be preserving the user's exact scroll position when refreshing or returning to longer pages, particularly recipe search results, so users can continue browsing where they left off.

Additional future improvements could include expanded recipe filtering, grocery list generation, and more flexible meal planning options.

## Acknowledgments

Recipe data is provided by TheMealDB.