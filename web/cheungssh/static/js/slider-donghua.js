function hexFromRGB(r, g, b) {
                        var hex = [
                            r.toString(16),
                            g.toString(16),
                            b.toString(16)
                        ];
                        //
                       var hao =$("#red").slider("value");
                       //console.log(hao);

                        //
                        $.each(hex, function (nr, val) {
                            if (val.length === 1) {
                                hex[nr] = "0" + val;
                            }
                        });
    //修改主界面颜色
                        var mainColor="#"+hex.join("").toUpperCase();
                        $("#sidebar").css({"background":mainColor});
                        $(".dashborad").css({"background":mainColor});
                        $(".header").css({"background":mainColor});

                        return hex.join("").toUpperCase();
                    }
                    function refreshSwatch() {
                        var red = $("#red").slider("value"),
                                green = $("#green").slider("value"),
                                blue = $("#blue").slider("value"),
                                hex = hexFromRGB(red, green, blue);
                    }
                    $(function () {
                        $("#red, #green, #blue").slider({
                            orientation: "horizontal",
                            range: "min",
                            max: 255,
                            value: 127,
                            slide: refreshSwatch,
                            change: refreshSwatch
                        });
                        $("#red").slider("value", 0);
                        $("#green").slider("value", 0);
                        $("#blue").slider("value", 0);
                    });