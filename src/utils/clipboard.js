import toastr from 'toastr'

export const copyToClipboard = (text) => {
  navigator.clipboard
    .writeText(text)
    .then(() => toastr.success('Code copied successfully!', 'Copy to clipboard'))
    .catch((error) => toastr.error(error, 'Copy to clipboard'))
}
