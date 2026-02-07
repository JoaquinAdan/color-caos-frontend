import { Link } from '@tanstack/react-router'

export default function About() {
  return (
    <div>
      <h1>About Page</h1>
      <p>This is the about page with some information.</p>
      <nav>
        <Link to="/" className="link">
          Back to Home
        </Link>
      </nav>
    </div>
  )
}
