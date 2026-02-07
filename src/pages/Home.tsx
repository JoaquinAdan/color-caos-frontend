import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { LuArrowRight, LuSparkles } from 'react-icons/lu'

export default function Home() {
  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Welcome Home!</h1>
        <p className="text-muted-foreground text-lg">
          Check out these example shadcn/ui components
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Card Example 1 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LuSparkles className="w-5 h-5" />
              Feature Card
            </CardTitle>
            <CardDescription>
              This is an example card component from shadcn/ui
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Cards are useful for grouping related content and actions. 
              They provide a clean, organized way to display information.
            </p>
          </CardContent>
          <CardFooter className="gap-2">
            <Button variant="default">Primary Action</Button>
            <Button variant="outline">Secondary</Button>
          </CardFooter>
        </Card>

        {/* Card Example 2 */}
        <Card>
          <CardHeader>
            <CardTitle>Another Card</CardTitle>
            <CardDescription>
              Demonstrating different button variants
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <p className="text-sm font-medium">Button Variants:</p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="default">Default</Button>
                <Button size="sm" variant="secondary">Secondary</Button>
                <Button size="sm" variant="destructive">Destructive</Button>
                <Button size="sm" variant="ghost">Ghost</Button>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Link to="/about" className="w-full">
              <Button variant="outline" className="w-full gap-2">
                Go to About Page
                <LuArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
