using System;

namespace HashGenerator
{
    class Program
    {
        static void Main(string[] args)
        {
            string password = "admin123";
            
            // Generiši BCrypt hash sa istim salt rounds kao backend (11)
            string hash = BCrypt.Net.BCrypt.HashPassword(password, 11);
            
            Console.WriteLine($"Password: {password}");
            Console.WriteLine($"BCrypt Hash: {hash}");
            
            // Testiraj verifikaciju
            bool isValid = BCrypt.Net.BCrypt.Verify(password, hash);
            Console.WriteLine($"Hash verification test: {isValid}");
        }
    }
}