
export default function Footer() {
    return (
        <div className="flex flex-col md:flex-row bg-white py-14 px-8 gap-8 md:justify-between">
            <div className="flex flex-col md:flex-row md:justify-evenly items-center gap-8">
                <a className="border-secondary text-secondary border-2 rounded-lg py-1 px-5 max-w-[200px] hover:border-primary hover:text-primary duration-300" href="/upload">
                    Upload papers
                </a>
                {/* <div className="flex flex-col gap-3">
                    <div className="flex flex-row gap-3">
                    <span className="material-symbols-outlined">
                        mail
                    </span>
                    <a href="mailto:info@neatnest.com">info@structuralpapers.com</a>
                    </div>
                </div> */}
            </div>
            <div className="flex flex-col md:grid-cols-4 text-xs gap-3 justify-items-center">
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