import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <main className="recipe-error">
      <h1>Page Not Found</h1>

      <p>
        Sorry, the page you're looking for doesn't exist.
      </p>

      <Link
        className="back-link"
        to="/"
      >
        Return Home
      </Link>
    </main>
  );
}

export default NotFoundPage;