# résumé source

`public/suvir-potdar-resume.pdf` is generated from `resume.html`, so edits go
here rather than into a PDF editor.

## Regenerate

```
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless --disable-gpu --no-pdf-header-footer --virtual-time-budget=9000 \
  --print-to-pdf=../public/suvir-potdar-resume.pdf resume.html
```

Then check `/resume` on the site.

## Keep it one page

The layout is tuned to fill a single page with about 25px to spare. After
editing, confirm it still fits:

```
swift -e 'import PDFKit; print(PDFDocument(url: URL(fileURLWithPath: "../public/suvir-potdar-resume.pdf"))!.pageCount)'
```

Anything other than `1` means something needs trimming.

The same command without `.pageCount` dumps the text layer, which is worth a
look after big edits — it is what an applicant tracking system reads.
