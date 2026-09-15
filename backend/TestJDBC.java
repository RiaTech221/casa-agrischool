import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class TestJDBC {
    public static void main(String[] args) {
        try {
            Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/casa_agrischool?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC", "root", "");
            Statement stmt = conn.createStatement();
            stmt.execute("SET FOREIGN_KEY_CHECKS=0");
            stmt.execute("ALTER TABLE questions_forum MODIFY auteur_id BIGINT NULL");
            stmt.execute("ALTER TABLE reponses_forum MODIFY auteur_id BIGINT NULL");
            stmt.execute("SET FOREIGN_KEY_CHECKS=1");
            System.out.println("SUCCESS");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
