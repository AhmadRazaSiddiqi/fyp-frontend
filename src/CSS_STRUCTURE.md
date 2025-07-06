# CSS Structure Documentation

## Overview
This project uses a modular CSS approach with two main files:

### 1. `App.css` - Main Application Styles
Contains:
- CSS Variables (color scheme, typography)
- Global styles (HTML, body, typography)
- Layout components (page-container, sidebar, navbar)
- Utility classes
- Responsive design breakpoints

### 2. `components.css` - Component Library
Contains all reusable component styles:
- Alert components
- Avatar components
- Badge components
- Card components
- Drawer components
- Grid system
- Image components
- Input components
- List components
- Modal components
- Navigation components
- Rating components
- Slider components
- Submenu components
- Toast components

## Color Scheme
The application uses a consistent color palette defined in CSS variables:

```css
--pink-color              : #BD5D78
--light-pink-ripple-effect: #e97798
--dark-blue-color         : #333258
--background-color        : #F3F3F3
--offline-grey-color      : rgb(172, 172, 172)
--extra-orange-color      : #EF836D
--complimentary-blue-color: #1AB3B3
--notification-or-error   : #F44336
--onlinestatus-or-success : #00d09c
--awaystatus-or-warning   : #FF9800
--dark-grey               : #282c34
--light-grey              : rgb(243, 243, 243)
--grey                    : rgb(228, 228, 228)
--white                   : white
```

## Typography
- Font Family: 'Comfortaa', cursive
- Base Font Size: 62.5% (10px) for easy rem calculations
- Responsive typography with rem units

## Layout System
- Grid-based layout with CSS Grid
- Flexbox for component alignment
- Responsive breakpoints at 1015px and 768px
- Mobile-first approach

## Component Usage
All components follow a consistent naming convention and can be used with utility classes:

```html
<!-- Example: Card component -->
<div class="card">
  <div class="card-header">Header</div>
  <div class="card-body">Content</div>
  <div class="card-footer">Footer</div>
</div>

<!-- Example: Button component -->
<button class="solid-primary-btn">Primary Button</button>
<button class="solid-secondary-btn">Secondary Button</button>
```

## Benefits of This Structure
1. **No External Dependencies**: All styles are local, no external CSS imports needed
2. **Modular**: Easy to maintain and update individual components
3. **Consistent**: Unified design system across the application
4. **Responsive**: Mobile-friendly with proper breakpoints
5. **Performance**: No external network requests for CSS

## Migration from External CSS
The external CSS file (`https://enztron-temp-deployed-branch.netlify.app/components.css`) has been completely replaced with local files, ensuring:
- Better performance
- No dependency on external services
- Full control over styling
- Consistent behavior across environments 