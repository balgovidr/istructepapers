'use client'

import React, {useState} from 'react';
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.js',
    import.meta.url,
  ).toString();

export default function PaperComponent({paper, user}) {
    const [displayedPages, setDisplayedPages] = useState(0);

    const onDocumentLoadSuccess = async ({ numPages }) => {
        if (user) {
            // If the user is logged in, check if they have prior access to this specific paper or this months paper
            if (user.papersAllowed.includes(paper.id) || user.monthsAllowed.includes(paper.month + '-' + paper.year)) {
                setDisplayedPages(numPages);
            } else if (user.papersViewable >= 1) {
                // If they don't have access to this paper, then deduct from their credits and show the paper
                await updateDoc(doc(db, "users", user.uid), {
                    papersAllowed: [...user.papersAllowed, paper.id],
                    papersViewable: user.papersViewable-1
                })
            
                setDisplayedPages(numPages);
            } else {
                setDisplayedPages(1)
            }
        } else {
          setDisplayedPages(2)
        }
      };
    
    function PageLoadDiv(elementId) {
      return (
        <div className='w-full md:w-[600px] min-h-[1.4vw] md:min-h-[850px] my-3 p-4 overflow-hidden bg-white' id={"loading-" + elementId}>
          <div className="flex flex-col animate-pulse gap-4">
            <div className='h-8 w-2/5 bg-slate-200 rounded'>&nbsp;</div>
            <div className='h-4 w-2/3 bg-slate-200 rounded'>&nbsp;</div>
            <div className='h-[40vh] w-2/3 bg-slate-200 rounded self-center'>&nbsp;</div>
            <div className='h-4 w-3/5 bg-slate-200 rounded self-center'>&nbsp;</div>
            <div className='h-4 w-3/5 rounded'>&nbsp;</div>
            <div className='h-4 w-full bg-slate-200 rounded'>&nbsp;</div>
            <div className='h-4 w-full bg-slate-200 rounded'>&nbsp;</div>
            <div className='h-4 w-full bg-slate-200 rounded'>&nbsp;</div>
            <div className='h-4 w-full bg-slate-200 rounded'>&nbsp;</div>
            <div className='h-4 w-4/5 bg-slate-200 rounded'>&nbsp;</div>
          </div>
        </div>
      )
    }

    function closeLoadDiv(elementId) {
      console.log("loading-" + elementId)
      const element = document.getElementById("loading-" + elementId);

      if (element) {
        element.parentNode.removeChild(element);
      }
    }

    return (
        <Document file={paper.downloadUrl} options={{ workerSrc: "/pdf.worker.js" }} onLoadSuccess={onDocumentLoadSuccess} onLoadError={console.error} loading={PageLoadDiv("main")}>
            {displayedPages === 0 ?
              <p>Loading...</p> :
              Array.from({ length: displayedPages }, (_, index) => (
                <div key={index}>
                  <Page key={index} pageNumber={index + 1} renderTextLayer={false} renderAnnotationLayer={false} className="w-full md:w-[600px]" loading="Loading page..." canvasBackground="#d3d3d3"/>
                  <span className="font-size-12">Page {index+1}</span>
                  <br />
                </div>
              ))}
        </Document>
    )
}