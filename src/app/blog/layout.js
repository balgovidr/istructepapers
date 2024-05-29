export default function Layout({children}) {
    return (
        <div className="w-full flex flex-col items-center">
            <div className="p-7 max-w-screen-md">
            {children}
            </div>
        </div>
    )
  }