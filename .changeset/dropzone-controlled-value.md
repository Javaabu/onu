---
"@javaabu/onu": minor
---

`DropzoneUploader`: controlled `value` / `onValueChange` and `defaultValue` for its file list, so an edit page can show files already saved on the record (`{ id, name, size?, type?, url?, thumbnailUrl? }`), let the user remove them, and submit the kept ids as hidden inputs. With an uploader, finished uploads are added to the value (`{ id, name, size, type, file, response }`); without one, picked `File`s are. Existing files count toward `maxFiles`; removing a file moves focus back to the Browse button and is announced. New types `DropzoneFile` and `UploadedFile`. Without the new props the uploader behaves as before, except that with `multiple={false}` and an uploader, a finished upload now replaces the previous one instead of listing both.
