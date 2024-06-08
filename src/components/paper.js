'use client'

import { updateDoc, doc } from 'firebase/firestore';
import { db } from '@/firebase/firebaseClient';
import React, {useState} from 'react';
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
//If facing CORS issues: https://stackoverflow.com/questions/37760695/firebase-storage-and-access-control-allow-origin

export default function PaperComponent({paper, pageLimit}) {
  console.log(pageLimit)
    const [displayedPages, setDisplayedPages] = useState(0);

    const onDocumentLoadSuccess = async ({ numPages }) => {
        if (pageLimit === "All") {
          setDisplayedPages(numPages)
        } else {
          setDisplayedPages(pageLimit)
        }
      };
    
    function PageLoadDiv() {
      return (
        <div className='w-full md:max-w-[800px] md:min-w-[600px] min-h-[1.4vw] md:min-h-[850px] my-3 p-4 overflow-hidden bg-white'>
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

    return (
        <Document file={paper.downloadUrl} options={{ workerSrc: "/pdf.worker.js" }} onLoadSuccess={onDocumentLoadSuccess} onLoadError={console.error} loading={<PageLoadDiv />}>
            {displayedPages === 0 ?
              <PageLoadDiv /> :
              Array.from({ length: displayedPages }, (_, index) => (
                <div key={index} className='flex flex-col max-w-[100vw] items-center'>
                  <Page key={index} pageNumber={index + 1} renderTextLayer={false} renderAnnotationLayer={false} className="!w-full md:max-w-[600px]" loading={<PageLoadDiv />} canvasBackground="#FFFFFF"/>
                  <span className="font-size-12 w-full text-center">Page {index+1}</span>
                  <br />
                </div>
              ))}
        </Document>
    )
}