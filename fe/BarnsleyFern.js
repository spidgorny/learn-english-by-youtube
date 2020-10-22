// Barnsley fern fractal

//6/17/16 aev
function pBarnsleyFern(canvasId, lim) {
    // DCLs
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    let x = 0.,
        y = 0.,
        xw = 0.,
        yw = 0.,
        r;
    let zoom = 100;

    // Like in PARI/GP: return random number 0..max-1
    function randgp(max) {
        return Math.floor(Math.random() * max)
    }

    // Clean canvas
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, w, h);

    function onePixel() {
        r = randgp(100);
        if (r <= 1) {           // stem
            xw = 0;
            yw = 0.16 * y;
        } else if (r <= 8) {    // right part
            xw = 0.2 * x - 0.26 * y;
            yw = 0.23 * x + 0.22 * y + 1.6;
        } else if (r <= 15) {   // left part
            xw = -0.15 * x + 0.28 * y;
            yw = 0.26 * x + 0.24 * y + 0.44;
        } else {
            xw = 0.85 * x + 0.04 * y;
            yw = -0.04 * x + 0.85 * y + 1.6;
        }
        x = xw;
        y = yw;
        ctx.fillStyle = "green";
        ctx.fillRect(x * zoom + w / 2, -y * zoom + h, 1, 1);
    }

    // MAIN LOOP
    function repeatForever() {
        setTimeout(() => {
            for (let i = 0; i < lim; i++) {
                onePixel()
            } //fend i
            repeatForever();
        }, 0);
    }

    repeatForever();
}
