import * as React from "react"
import PropTypes from "prop-types"

import { cn } from "@/lib/utils"

const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border-2 border-border/10 bg-card text-card-foreground shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm",
      className
    )}
    style={{
      backgroundColor: 'hsl(var(--card))',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)'
    }}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6 pb-4", className)} {...props} />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight text-foreground",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-muted-foreground leading-relaxed", className)} {...props} />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-2", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center p-6 pt-2", className)} {...props} />
))
CardFooter.displayName = "CardFooter"

// PropTypes definitions
const commonPropTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
}

Card.propTypes = commonPropTypes
CardHeader.propTypes = commonPropTypes
CardTitle.propTypes = commonPropTypes
CardDescription.propTypes = commonPropTypes
CardContent.propTypes = commonPropTypes
CardFooter.propTypes = commonPropTypes

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
