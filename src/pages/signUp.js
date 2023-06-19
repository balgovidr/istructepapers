import '../App.css';
import logo from "../assets/Logo.svg";

export default function SignUp() {
  return (
    <div class="row mg-a-10p shadow">
        <div class="col-1 background-color-primary center">
            <img src={logo} alt="Paper trail logo" height="100"/>
        </div>
        <div class="col-1 column pd-a-10p">
            <h2>Registration</h2>
            <form class="column">
                <label for="first-name">First Name</label>
                <input type="text" class="form-control" id="first-name" placeholder="First Name" required/>
                <label for="last-name">Last Name</label>
                <input type="text" class="form-control" id="last-name" placeholder="Last Name" required/>
                <label for="username">Username</label>
                <input type="text" class="form-control" id="username" placeholder="Username" required/>
                <label for="email">Email</label>
                <input type="email" class="form-control" id="email" placeholder="Email" required/>
                <label for="password">Password</label>
                <input type="password" class="form-control" id="password" placeholder="Password" required/>
                <div class="row justify-content-center align-items-center mg-t-25">
                    <button type="submit" class="btn btn-primary">Sign Up</button>
                    <a href="/login" class="mg-l-20 font-size-12 text-color-grey underline">I'm already a member</a>
                </div>
            </form>
        </div>
    </div>
  );
}