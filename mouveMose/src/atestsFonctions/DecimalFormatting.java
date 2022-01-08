package mouveMose.src.atestsFonctions;

public class DecimalFormatting {
    public static void main(String args[]){
        float valeur = 1080;
        float pourcentage = 33;

        float out = ( valeur * (pourcentage / 100) ) ;
        int out2 = (int)out;

        System.out.println(out2); 

        }
    }
