import Link from "next/link"


const Navbar = () => {
  return (
    <div className="flex flex-row justify-between">
        <div className="flex flex-row justify-between gap-8 font-bold px-4 py-2">
            <Link href={"/"}>Home</Link>
            <Link href={"/books"}>Books</Link>
            <Link href={"/borrowBook"}>Borrow Book</Link>
        </div>
        <div className="flex flex-row justify-between gap-8 font-bold px-4 py-2">
            <Link href={"/signup"}>Signup</Link>
            <Link href={"/login"}>Login</Link>
            <Link href={"/logout"}>Logout</Link>
        </div>
    </div>
  )
}

export default Navbar