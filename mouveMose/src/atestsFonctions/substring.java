package mouveMose.src.atestsFonctions;

public class substring {
    public static void main(String[] args) {
        String str = "L,H,D,H,H,R";
        String[] words = str.split(",");
        
        for (String word : words) {
            System.out.println(word);
        }
    }
}