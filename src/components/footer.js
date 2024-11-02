import EmailIcon from '@mui/icons-material/Email';

export default function Footer({backgroundColor = "white"}) {
    return (
        <div className={"flex flex-col md:flex-row py-14 mx-8 gap-8 md:justify-between border-primary border-t " + (backgroundColor == "white" ? "bg-white" : "bg-primary")}>
            <div className="flex flex-col md:flex-row md:justify-evenly items-center gap-8">
                <a className="border-secondary text-secondary border rounded-lg py-2 px-5 max-w-[200px] hover:bg-secondary hover:text-white duration-300" href="/upload">
                    Upload papers
                </a>
            </div>
            <div className={"flex flex-col gap-3 " + (backgroundColor == "white" ? "text-black" : "text-white")}>
                <span className='text-xs'>For enquiries and feedback please contact</span>
                <a href="mailto:info@structuralpapers.com" className="flex flex-row gap-3 text-sm">
                    <EmailIcon color='disabled'/>
                    info@structuralpapers.com
                </a>
            </div>
            <div className={"flex flex-col md:grid-cols-4 text-xs gap-3 justify-items-center" + (backgroundColor == "white" ? "text-black" : "text-white")}>
                <div>
                    Structural Papers &copy; {new Date().getFullYear()}
                </div>
                <div className="flex flex-row justify-between gap-5">
                    <a href="/statements/privacy-policy" className="underline">Privacy policy</a>
                    <a href="/statements/cookie-policy" className="underline">Cookie policy</a>
                </div>
            </div>  
        </div>
    )
}