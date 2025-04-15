import register from 'preact-custom-element'
import './layout-preview.css'

function LayoutPreview ({ active, layout }) {
  return (
    <>
      <div class='html' />
      <div class='css' />
      <div class='js' />
      <div class='result' />
    </>
  )
}

// Register the Preact component as a custom element
register(LayoutPreview, 'layout-preview', ['active', 'layout'], { shadow: false })
