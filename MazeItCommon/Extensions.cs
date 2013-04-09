using System;
using System.Runtime.CompilerServices;
namespace MazeItCommon
{
    public static class Extensions
    {
        [InlineCode("{o}")]
        public static dynamic Me(this object o)
        {
            return o;
        }

        public static string RandomColor()
        {
            return "#" + ( (int) ( Math.Floor(Math.Random() * 16777215) ) ).ToString(16);
        }

        public static string ShadeColor(this string color, int porcent)
        {
            var R = int.Parse(color.JsSubstring(1, 3), 16);
            var G = int.Parse(color.JsSubstring(3, 5), 16);
            var B = int.Parse(color.JsSubstring(5, 7), 16);

            R = int.Parse(( R * ( 100 + porcent ) / 100 ).ToString());
            G = int.Parse(( G * ( 100 + porcent ) / 100 ).ToString());
            B = int.Parse(( B * ( 100 + porcent ) / 100 ).ToString());

            R = ( R < 255 ) ? R : 255;
            G = ( G < 255 ) ? G : 255;
            B = ( B < 255 ) ? B : 255;

            var RR = ( ( R.ToString(16).Length == 1 ) ? "0" + R.ToString(16) : R.ToString(16) );
            var GG = ( ( G.ToString(16).Length == 1 ) ? "0" + G.ToString(16) : G.ToString(16) );
            var BB = ( ( B.ToString(16).Length == 1 ) ? "0" + B.ToString(16) : B.ToString(16) );

            return "#" + RR + GG + BB;
        }
    }
}