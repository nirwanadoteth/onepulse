declare module "*.css" {
  declare module "*.css" {
    const content: never
    const classes: { readonly [key: string]: string }

    export default content
    export default classes
  }
}

declare module "*.scss" {
  const content: never
  export default content
}
