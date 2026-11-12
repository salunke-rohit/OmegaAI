import "./Sidebar.css"

function Sidebar () {
    return(
        <section className="sidebar">
            { /* new chat button */}
            <button>
                <img src="src/assets/omega.png" alt="omegaLogo" className="logo" />
                <span> <i className="fa-regular fa-pen-to-square"></i> </span>
            </button>

            { /* history */}

            <ul className="history">
                <li>thread 1</li>
                <li>thread 2</li>
                <li>thread 3</li>
            </ul>

            { /* sign  */}
            <div className="sign">
                <p>By RohitSalunke &hearts;  </p>
            </div>

        </section>
    )
}


export default Sidebar;
