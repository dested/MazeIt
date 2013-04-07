using System.Runtime.CompilerServices;
namespace Blockade
{
    public static class Extensions
    {
        [InlineCode("{o}")]
        public static dynamic Me(this object o)
        {
            return o;
        }
    }
}