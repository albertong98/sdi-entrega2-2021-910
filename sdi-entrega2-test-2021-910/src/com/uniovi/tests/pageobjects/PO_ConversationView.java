package com.uniovi.tests.pageobjects;

import java.util.List;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class PO_ConversationView extends PO_NavView {
	public static void openChat(WebDriver driver,String texto) {
		List<WebElement> elementos = PO_View.checkElement(driver, "free","//td[contains(text(), '"+texto+"')]/following-sibling::*//a[contains(text(),'Abrir chat')]");
		elementos.get(0).click();
	}
	
	public static void checkConversationDeleted(WebDriver driver, int conversationIndex) {
		List<WebElement> elementos = driver.findElements(By.id(String.valueOf(conversationIndex)));
		elementos = elementos.get(0).findElements(By.xpath("//td"));
		String texto = elementos.get(0).getText();
		elementos = PO_View.checkElement(driver, "free","//td[contains(text(), '"+texto+"')]/following-sibling::*//a[contains(text(),'Eliminar chat')]");
		elementos.get(0).click();
		PO_View.checkElementNotInPage(driver, texto);
	}
	
	public static void checkLast(WebDriver driver) {
		int i = PO_View.checkElement(driver, "free","//tr").size() - 2;
		checkConversationDeleted(driver,i);
	}
}
